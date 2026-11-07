import sys, glob, subprocess
# usage: sheet.py out.png cols w file1 file2 ...   (kontaktiarkki ffmpegillä)
out, cols, w = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
fs = sys.argv[4:]
n = len(fs)
rows = (n + cols - 1) // cols
a = ['ffmpeg', '-y', '-v', 'error']
for f in fs: a += ['-i', f]
h = int(w * 9 / 16)
flt = ''.join(f'[{i}:v]scale={w}:{h}[s{i}];' for i in range(n)) + ''.join(f'[s{i}]' for i in range(n)) + f'xstack=inputs={n}:layout=' + '|'.join(f'{(i%cols)*w}_{(i//cols)*h}' for i in range(n))
subprocess.run(a + ['-filter_complex', flt, out], check=True)
