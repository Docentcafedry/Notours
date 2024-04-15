FROM mongo

COPY tours.json /tours.json

CMD mongoimport --host mongo --db Notours --collection tours --type json --file /tours.json --jsonArray