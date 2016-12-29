#!/bin/bash
numberOfTests=$1
count=$1
nbFails=0

while [ $count -gt 0 ]; do
    echo "count = " $count
    node node_modules/intern/runner.js config=test/functional/testsCommon.js browsers=chrome_linux selenium=local
    result=$?
    let "nbFails=$nbFails+$result"
    
    echo "number of fails = " $nbFails

    let "count=$count-1"
done

    echo "number of fails: " $nbFails "/" $numberOfTests
