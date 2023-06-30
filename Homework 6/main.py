from flask import Flask, request, jsonify;
import requests
from geolib import geohash 
from flask_cors import cross_origin


app = Flask(__name__)

@app.route('/')
@cross_origin()
def index():
    return app.send_static_file('home.html')

@app.route('/getData', methods=['GET'])
@cross_origin()
def fetchData():
    ticketmasterAPI = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=ABCD'
    keyword = request.args.get('keyword')
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')
    radius = request.args.get('distance')
    category = request.args.get('category')
    if(category == "default"):
        finalAPI = ticketmasterAPI + '&keyword=' + keyword + '&geoPoint=' + geohash.encode(latitude, longitude, 7) + '&radius=' + radius + '&unit=miles'
    else:
        finalAPI = ticketmasterAPI + '&keyword=' + keyword + '&geoPoint=' + latitude + ',' + longitude + '&radius=' + radius + '&unit=miles' + '&segmentId=' + category
    response = requests.get(finalAPI)
    return jsonify(response.json())

@app.route('/getVenue', methods=['GET'])
@cross_origin()
def fetchVenue():
    id = request.args.get('venue')
    venueAPI = 'https://app.ticketmaster.com/discovery/v2/venues.json?apikey=ABCD&keyword='+id
    response = requests.get(venueAPI)
    print(response)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=True)
    
    