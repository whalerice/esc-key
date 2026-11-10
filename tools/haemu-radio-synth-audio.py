#!/usr/bin/env python3
"""Synthesize haemu-radio placeholder WAV beds + SFX (no voice). Original project audio."""

from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

import numpy as np

SR = 22050
OUT = Path(__file__).resolve().parents[1] / "public/themes/haemu-radio/audio"
RNG = np.random.default_rng(879_2011)


def write_wav(name: str, samples: np.ndarray) -> None:
    samples = np.clip(samples, -1.0, 1.0)
    pcm = (samples * 32767.0).astype(np.int16)
    path = OUT / name
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    peak = float(np.max(np.abs(samples)))
    rms = float(np.sqrt(np.mean(samples * samples)))
    print(f"  {name}: {len(samples) / SR:.3f}s peak={peak:.3f} rms={rms:.3f}")


def env_adsr(n: int, a: float, d: float, s: float, r: float) -> np.ndarray:
    a_n = max(1, int(a * SR))
    d_n = max(1, int(d * SR))
    r_n = max(1, int(r * SR))
    s_n = max(0, n - a_n - d_n - r_n)
    parts = [
        np.linspace(0.0, 1.0, a_n, endpoint=False),
        np.linspace(1.0, s, d_n, endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0.0, r_n, endpoint=True),
    ]
    e = np.concatenate(parts)
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    return e[:n]


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    """One-pole lowpass; cutoff as fraction of Nyquist-ish Hz."""
    if cutoff <= 0:
        return np.zeros_like(x)
    rc = 1.0 / (2.0 * math.pi * cutoff)
    dt = 1.0 / SR
    a = dt / (rc + dt)
    y = np.empty_like(x)
    prev = 0.0
    for i, v in enumerate(x):
        prev = prev + a * (float(v) - prev)
        y[i] = prev
    return y


def highpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    return x - lowpass(x, cutoff)


def bandpass(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return lowpass(highpass(x, lo), hi)


def soft_noise(n: int, color: float = 0.0) -> np.ndarray:
    w = RNG.standard_normal(n).astype(np.float64)
    if color > 0:
        w = lowpass(w, color)
    peak = np.max(np.abs(w)) or 1.0
    return w / peak


def sine(n: int, hz: float, phase: float = 0.0) -> np.ndarray:
    t = np.arange(n) / SR
    return np.sin(2.0 * math.pi * hz * t + phase)


def seamless_fade(x: np.ndarray, ms: float = 40.0) -> np.ndarray:
    """Crossfade ends so Howler loop:true does not click."""
    n = len(x)
    fade = max(1, int(ms * SR / 1000.0))
    fade = min(fade, n // 4)
    out = x.copy()
    ramp = np.linspace(0.0, 1.0, fade)
    head = out[:fade]
    tail = out[-fade:]
    mixed = head * ramp + tail * (1.0 - ramp)
    out[:fade] = mixed
    out[-fade:] = mixed
    return out


def tone_burst(hz: float, dur: float, amp: float = 0.35, a=0.01, r=0.04) -> np.ndarray:
    n = int(dur * SR)
    return sine(n, hz) * env_adsr(n, a, 0.02, 0.85, r) * amp


def two_tone(f1: float, f2: float, gap: float = 0.08, hold: float = 0.22, amp: float = 0.32) -> np.ndarray:
    a = tone_burst(f1, hold, amp=amp, a=0.02, r=0.05)
    silence = np.zeros(int(gap * SR))
    b = tone_burst(f2, hold * 1.15, amp=amp * 0.9, a=0.02, r=0.08)
    raw = np.concatenate([a, silence, b])
    # AM radio grit — no speech
    grit = soft_noise(len(raw), 1800.0) * 0.04
    filtered = bandpass(raw + grit, 400.0, 3200.0)
    peak = np.max(np.abs(filtered)) or 1.0
    return filtered / peak * amp


def bed_pad(seconds: float, fundamentals: list[tuple[float, float]], noise_hz: float, noise_amp: float) -> np.ndarray:
    n = int(seconds * SR)
    out = np.zeros(n)
    for hz, amp in fundamentals:
        # slight detune pair for chorus warmth
        out += sine(n, hz) * amp
        out += sine(n, hz * 1.003, phase=0.7) * amp * 0.45
    noise = soft_noise(n, noise_hz) * noise_amp
    out += noise
    # very slow LFO duck for living bed
    lfo = 0.82 + 0.18 * sine(n, 0.07)
    out *= lfo
    out = seamless_fade(out, 50.0)
    peak = np.max(np.abs(out)) or 1.0
    return out / peak * 0.28


def synth_beds() -> None:
    # opening kept on disk but uncued — soft distant hum, no boom
    write_wav(
        "opening.wav",
        bed_pad(
            8.0,
            [(110.0, 0.12), (165.0, 0.05), (330.0, 0.03)],
            noise_hz=900.0,
            noise_amp=0.04,
        ),
    )
    # R-MU-01 안개 정류장 — murky mid pad + soft hiss
    write_wav(
        "fog-stop.wav",
        bed_pad(
            8.0,
            [(98.0, 0.14), (147.0, 0.08), (196.0, 0.05), (392.0, 0.025)],
            noise_hz=700.0,
            noise_amp=0.07,
        ),
    )
    # R-MU-02 새벽 세 시의 커피 — warmer mids
    write_wav(
        "3am-coffee.wav",
        bed_pad(
            8.0,
            [(130.8, 0.13), (196.0, 0.09), (261.6, 0.05), (523.0, 0.02)],
            noise_hz=1100.0,
            noise_amp=0.045,
        ),
    )
    # R-MU-03 먼 바다 — swell + filtered surf
    sea = bed_pad(8.0, [(73.4, 0.16), (110.0, 0.06)], noise_hz=400.0, noise_amp=0.02)
    n = len(sea)
    surf = soft_noise(n, 600.0)
    swell = 0.5 + 0.5 * sine(n, 0.11)
    sea = sea + bandpass(surf, 80.0, 900.0) * 0.12 * swell
    sea = seamless_fade(sea / (np.max(np.abs(sea)) or 1.0) * 0.28, 50.0)
    write_wav("far-sea.wav", sea)
    # R-MU-04 바람이 지나간 자리
    wind = soft_noise(int(8.0 * SR), 500.0)
    gust = 0.55 + 0.45 * sine(len(wind), 0.09, phase=1.2)
    wind = highpass(wind, 180.0) * 0.22 * gust
    wind += sine(len(wind), 87.0) * 0.04
    wind = seamless_fade(wind / (np.max(np.abs(wind)) or 1.0) * 0.26, 50.0)
    write_wav("wind.wav", wind)
    # R-MU-05 방파제 — low pulse + grit
    break_ = bed_pad(8.0, [(65.4, 0.15), (98.0, 0.07), (130.8, 0.04)], noise_hz=350.0, noise_amp=0.06)
    n = len(break_)
    pulse = (0.7 + 0.3 * np.clip(np.sin(2 * math.pi * 0.5 * np.arange(n) / SR), 0, 1)) 
    break_ = break_ * pulse
    break_ = seamless_fade(break_ / (np.max(np.abs(break_)) or 1.0) * 0.28, 50.0)
    write_wav("breakwater.wav", break_)


def synth_clues() -> None:
    # Distinct two-tone radio fragments — captions carry the VO meaning
    write_wav("tease.wav", two_tone(523.25, 392.0, gap=0.06, hold=0.2, amp=0.3))  # C5→G4
    write_wav("d100.wav", two_tone(440.0, 554.37, gap=0.07, hold=0.24, amp=0.3))  # A4→C#5
    write_wav("d50.wav", two_tone(349.23, 466.16, gap=0.07, hold=0.24, amp=0.3))  # F4→A#4
    write_wav("d30.wav", two_tone(293.66, 349.23, gap=0.07, hold=0.24, amp=0.28))  # D4→F4
    write_wav("d7.wav", two_tone(261.63, 196.0, gap=0.09, hold=0.26, amp=0.28))  # C4→G3 (fading)


def synth_sfx() -> None:
    # Soft UI beep — clear, not harsh (P1/P2/P8 ok + P3 reject)
    beep_n = int(0.09 * SR)
    beep = sine(beep_n, 880.0) * env_adsr(beep_n, 0.004, 0.015, 0.55, 0.05) * 0.38
    beep = lowpass(beep, 4200.0)
    write_wav("sfx-beep.wav", beep)

    # Cartidge seat click
    cart_n = int(0.14 * SR)
    click = soft_noise(cart_n, 0.0)
    click = highpass(click, 1200.0) * env_adsr(cart_n, 0.001, 0.01, 0.2, 0.08) * 0.55
    body = sine(cart_n, 180.0) * env_adsr(cart_n, 0.002, 0.02, 0.35, 0.07) * 0.28
    write_wav("sfx-cart.wav", click + body)

    # Lock tumbler
    lock_n = int(0.16 * SR)
    tick = soft_noise(lock_n, 0.0)
    tick = bandpass(tick, 800.0, 5000.0) * env_adsr(lock_n, 0.001, 0.008, 0.15, 0.09) * 0.5
    metal = sine(lock_n, 1250.0) * env_adsr(lock_n, 0.001, 0.01, 0.25, 0.06) * 0.22
    metal += sine(lock_n, 2500.0) * env_adsr(lock_n, 0.001, 0.006, 0.1, 0.05) * 0.12
    write_wav("sfx-lock.wav", tick + metal)

    # Tape deck play engage
    tape_n = int(0.26 * SR)
    whir = soft_noise(tape_n, 900.0) * env_adsr(tape_n, 0.02, 0.04, 0.5, 0.1) * 0.38
    whir = bandpass(whir, 200.0, 2800.0)
    clack = soft_noise(tape_n, 0.0)
    clack = highpass(clack, 1500.0) * env_adsr(tape_n, 0.001, 0.012, 0.1, 0.12) * 0.55
    body = sine(tape_n, 140.0) * env_adsr(tape_n, 0.005, 0.03, 0.4, 0.1) * 0.2
    tape = whir + clack + body
    write_wav("sfx-tape.wav", tape / (np.max(np.abs(tape)) or 1.0) * 0.42)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"synth → {OUT} @ {SR} Hz")
    synth_beds()
    synth_clues()
    synth_sfx()
    print("done")


if __name__ == "__main__":
    main()
