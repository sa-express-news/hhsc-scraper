batch=10
x=$batch
while [ $x -gt 0 ]
do
	x=$(( $x - 1 ))
	npm run scraper batchidx=$((batch-x))
    sleep 90s
    echo "Batch complete, there are $x to go"
done