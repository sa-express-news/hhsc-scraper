x=10
while [ $x -gt 0 ]
do
	npm run scraper
    sleep 120s
    x=$(( $x - 1 ))
    echo "Batch complete, there are $x to go"
done