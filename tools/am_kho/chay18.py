import subprocess
A='/mnt/user-data/attachments/2356be9b-fc49-5c58-8dc5-1fc0d379e79b/'
for line in open('map16.txt'):
    l,f=line.split()
    subprocess.run(['rm','-rf','ra/'+l])
    r=subprocess.run(['python3','cat.py',A+f,l],stdin=subprocess.DEVNULL,capture_output=True,text=True)
    out=[x for x in (r.stdout+r.stderr).splitlines() if x and 'resampler' not in x and 'sample_rate' not in x]
    print('\n'.join(out[-14:]),flush=True)
