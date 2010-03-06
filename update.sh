#!/bin/sh
git ci -a -m'fixed' && git push && ssh komagata.org "cd ~/komagata.org/canvas-prowler && git pull"
