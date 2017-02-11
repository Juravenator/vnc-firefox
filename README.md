# vnc-firefox

This code fetches all the major firefox versions and packages each of them into
a docker container published at https://hub.docker.com/r/juravenator/vnc-firefox/.

The containers run LXDE and a vnc server at port 5901.

To run, for example firefox version 38, execute
```bash
docker run -it -p 5901:5901 -p 6901:6901 juravenator/vnc-firefox:38
```

and connect with your vnc client of preference to `localhost:5901`, the password is `password`.
