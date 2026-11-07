# Glissandotunnistin: log-taajuuksinen spektriflux, viistot harjanteet (2-8 oktaavia/s, ylös ja alas).
import sys, json, numpy as np
from scipy.io import wavfile
from scipy.signal import stft
from scipy.ndimage import uniform_filter1d, maximum_filter1d
fs,x=wavfile.read(sys.argv[1]); x=x.astype(np.float32)/32768; T0=float(sys.argv[2])
hop=128; f,t,Z=stft(x,fs,nperseg=2048,noverlap=2048-hop); M=np.abs(Z); t=t+T0
# log-taajuus 2 bin/puolisävel, 300 Hz - 6 kHz
fl=300*2**(np.arange(0,int(12*np.log2(6000/300)*2))/24)
idx=np.searchsorted(f,fl); L=np.log1p(200*M[idx])
# flux (uudet energiat) ja aikasuunnan tasaus pois (pitkät sävelet)
F=np.maximum(0,L[:,1:]-L[:,:-1]); F=np.c_[np.zeros(len(fl)),F]
F=F-uniform_filter1d(F,int(1.0/(hop/fs)),axis=1); F=np.maximum(F,0)
F=maximum_filter1d(F,3,axis=0)
dt=hop/fs; nb=len(fl); W=int(0.6/dt)
score={}
for direc in (+1,-1):
  best=np.zeros(F.shape[1])
  for oct_s in (2,3,4,6,8):
    bins_per_frame=oct_s*24*dt
    acc=np.zeros(F.shape[1])
    for b0 in range(0,nb,6):
      s=np.zeros(F.shape[1])
      n=0
      for k in range(W):
        b=int(round(b0+direc*k*bins_per_frame))
        if b<0 or b>=nb: break
        s[:F.shape[1]-k]+=F[b,k:]; n+=1
      if n>W*0.6: acc=np.maximum(acc,s/n)
    best=np.maximum(best,acc)
  score[direc]=best
base=uniform_filter1d(F.mean(0),int(2/dt))+1e-6
up=score[1]/base/ F.shape[0]**0; dn=score[-1]/base
out={'t':t[::8].round(3).tolist(),'up':up[::8].round(3).tolist(),'dn':dn[::8].round(3).tolist()}
json.dump(out,open(sys.argv[3],'w'))
