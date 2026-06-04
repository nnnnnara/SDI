sudo pkill -9 -f main.py
sudo pkill -9 -f gst-launch
sudo pkill -9 -f nvgstcapture
sudo pkill -9 -f final_default_speed.py

sudo systemctl stop nvargus-daemon
sudo pkill -9 nvargus-daemon

unset DISPLAY
unset XAUTHORITY

sudo systemctl start nvargus-daemon
sleep 2
