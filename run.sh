# remove the contents of the temporary dir, used as a backup if scraper breaks amid a huge session
rm -rf temp/*
# the number of times to run the scraper this round
batch=135
# will be used to countdown the remaining rounds
x=$batch
while [ $x -gt 0 ]
do
	x=$(( $x - 1 ))
	npm run scraper batchidx=$((batch-x))
	# give data.world time to ingest the new data
	sleep 90s
	echo "Batch complete, there are $x to go"
done