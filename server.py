from fastapi import FastAPI
import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

app=FastAPI()

API_KEY=os.getenv("VT_API_KEY")

if not API_KEY:
    raise RuntimeError("VT_API_KEY was not found")

@app.get("/")
def home():
    return {"message": "Phising Finder backend is running"}

def get_virustotal_report(url):
    url_id=base64.urlsafe_b64encode(
        url.encode()).decode().strip("=")

    headers={
        "x-apikey": API_KEY
        }

    reponse= requests.get(
        f"https://www.virustotal.com/api/v3/urls/{url_id}",
        headers=headers
    )
    return reponse

def calculate_risk(malicious, suspicious):

    total_detections = malicious + suspicious

    if total_detections == 0:
        return "CLEAN"

    elif total_detections <= 2:
        return "SUSPICIOUS"

    else:
        return "HIGH"

@app.get("/check")
def check_url(url: str):
    print("Checking URL:", url)

    response= get_virustotal_report(url)
    print ("VirusTotal status:", response.status_code)

    if response.status_code != 200:
        return{
            "url":url,
            "risk":"UNKNOWN",
            "error":"VirusTotal request failed",
            "status_code": response.status_code
        }

    data= response.json()

    stats=data["data"]["attributes"]["last_analysis_stats"] 

    malicious=stats["malicious"]
    suspicious=stats["suspicious"]

    risk= calculate_risk(malicious, suspicious)

    return{
        "url": url,
        "malicious": malicious,
        "suspicious": suspicious,
        "harmless": stats["harmless"],
        "undetected": stats["undetected"],
        "risk": risk

    }
