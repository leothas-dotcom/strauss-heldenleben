# Harpun glissandojen mittaus: korkeiden kaistojen (1-5 kHz) spektriflux + nopeiden näppäysten tiheys.
import sys, json, numpy as np
from scipy.io import wavfile
from scipy.signal import stft, medfilt
fs, x = wavfile.read(sys.argv[1]); x = x.astype(np.float32) / 32768; T0 = float(sys.argv[2])
f, t, Z = stft(x, fs, nperseg=1024, noverlap=1024-256)
M = np.abs(Z); t = t + T0
# HPSS-tyylinen: perkussiivinen osa = mediaani taajuussuunnassa vs aikasuunnassa
H = medfilt(M, (1, 17)); P = medfilt(M, (17, 1))
Pm = M * (P**2 / (P**2 + H**2 + 1e-12))
band = (f > 900) & (f < 5000)
L = np.log1p(100 * Pm[band])
flux = np.maximum(0, np.diff(L, axis=1)).sum(0); flux = np.r_[0, flux]
# tasoittamaton flux -> näppäystiheys: paikalliset huiput / 0,5 s ikkuna
dt = t[1]-t[0]
thr = medfilt(flux, 101) * 1.6 + 1e-6
pk = (flux > thr) & (flux > np.r_[0, flux[:-1]]) & (flux >= np.r_[flux[1:], 0])
win = int(0.5/dt); dens = np.convolve(pk.astype(float), np.ones(win), 'same') / 0.5   # näppäyksiä/s
# spektrin painopisteen kulku (glissandon suunta)
cent = (f[band,None]*Pm[band]).sum(0)/(Pm[band].sum(0)+1e-9)
out = {'t': t[::4].round(3).tolist(), 'flux': flux[::4].round(3).tolist(), 'dens': dens[::4].round(2).tolist(), 'cent': cent[::4].round(0).tolist()}
json.dump(out, open(sys.argv[3], 'w'))
# ehdokkaat: tiheys yli 7/s vähintään 0,4 s
on = dens > 7; ev = []; i = 0
while i < len(on):
    if on[i]:
        j = i
        while j < len(on) and on[j]: j += 1
        if (j - i) * dt >= 0.4:
            seg = slice(i, j); c = cent[seg]; slope = np.polyfit(np.arange(j-i)*dt, c, 1)[0] if j-i > 3 else 0
            ev.append((round(t[i], 2), round(t[j-1]-t[i], 2), round(float(dens[seg].max()), 1), int(slope)))
        i = j
    else: i += 1
for e in ev: print(e)
print(len(ev), 'ehdokasta')
