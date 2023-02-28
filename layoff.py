import numpy as np
from flask import Flask, render_template, redirect
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, select
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, Date
import json
from flask import Flask, jsonify
from sqlalchemy import create_engine, inspect
import csv, sqlite3
import pandas as pd
from pathlib import Path
import os

Path('layoff.sqlite').touch()
conn = sqlite3.connect('layoff.sqlite')
df = pd.read_csv("layoff.csv")
df.to_sql("layoff", conn, if_exists='replace', index=False, dtype={'id': 'INTEGER PRIMARY KEY'})

Base = automap_base()
engine = create_engine("sqlite:///layoff.sqlite")
inspector = inspect(engine)
inspector.get_table_names()
Base.prepare(autoload_with=engine)
Base.classes.keys()
Layoffs = Base.classes.layoff
session = Session(bind=engine)

TEMPLATE_DIR = os.path.abspath('templates')
STATIC_DIR = os.path.abspath('static')

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)

@app.route("/")
def welcome():
    return render_template("dash.html")

@app.route("/dataset")
def outputJson():
    conn = sqlite3.connect('layoff.sqlite')
    conn.row_factory = sqlite3.Row
    temp = conn.execute('SELECT * FROM layoff').fetchall()
    conn.close()
    result = [{k: item[k] for k in item.keys()} for item in temp]
    return jsonify(result)

@app.route("/industries")
def industry(): 
     session = Session(engine)
     results = []
     for i in (session.query(Layoffs.Industry).distinct()):
        results.append(i)
     session.close()
     industries = list(np.ravel(results))
     return jsonify(industries)

@app.route("/countries")
def country(): 
     session = Session(engine)
     results = []
     for i in (session.query(Layoffs.Country).distinct()):
        results.append(i)
     session.close()
     countries = list(np.ravel(results))
     return jsonify(countries)

@app.route("/dates")
def date(): 
     session = Session(engine)
     results = []
     for i in (session.query(Layoffs.Date).distinct()):
        results.append(i)
     session.close()
     dates = list(np.ravel(results))
     return jsonify(dates)

@app.route("/layoff/geoJSON/")
def layoff_geoJSON():
    with open("layoff.geojson") as file:
        json_decoded = json.load(file)
    return json_decoded 

@app.route("/dataset/barchart")
def barchart():
    conn = sqlite3.connect('layoff.sqlite')
    conn.row_factory = sqlite3.Row
    temp = conn.execute('SELECT Industry, SUM(Laid_Off_Count) AS Count FROM layoff GROUP BY Industry').fetchall()
    conn.close()
    result = [{k: item[k] for k in item.keys()} for item in temp]
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
