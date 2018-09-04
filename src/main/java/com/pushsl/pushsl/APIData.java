package com.pushsl.pushsl;

import com.fasterxml.jackson.databind.util.JSONPObject;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.pushsl.pushsl.Objects.Leg;
import com.pushsl.pushsl.Objects.RealTimeBusesAndMetros;
import com.pushsl.pushsl.Objects.SiteInfo;
import com.pushsl.pushsl.Objects.Trip;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

@Component
@SuppressWarnings("Duplicates")
public class APIData {


    public List<SiteInfo> getSiteInfo(String searchString) {
        String format = "json";
        String key = System.getenv("SiteInfoKey");
        boolean stationsonly = true;
        int maxresults = 10;

        String urlString = "http://api.sl.se/api2/typeahead." + format
                + "?key=" + key
                + "&searchstring=" + searchString
                + "&stationsonly=" + stationsonly
                + "&maxresults=" + maxresults;

        String result = fetch(urlString);

        Gson gson = new Gson();
        JsonObject jsonObject = new JsonParser().parse(result).getAsJsonObject();
        JsonArray array = jsonObject.get("ResponseData").getAsJsonArray();
        List<SiteInfo> siteInfoList = new ArrayList<>();

        for (int i = 0; i < array.size(); i++) {
            siteInfoList.add(gson.fromJson(array.get(i), SiteInfo.class));
        }

        return siteInfoList;

    }


    public List<RealTimeBusesAndMetros> getRealTimeInfo(String siteId, String timewindow) {
        String format = "json";
        String key = System.getenv("RealTimeKey");

        String urlString = "http://api.sl.se/api2/realtimedeparturesV4." + format
                + "?key=" + key
                + "&siteid=" + siteId
                + "&timewindow=" + timewindow;

        String result = fetch(urlString);

        Gson gson = new Gson();
        JsonObject jsonObject = new JsonParser().parse(result).getAsJsonObject();
        JsonArray arraymetros = jsonObject.get("ResponseData").getAsJsonObject().get("Metros").getAsJsonArray();
        List<RealTimeBusesAndMetros> realTimeList = new ArrayList<>();

        for (int i = 0; i < arraymetros.size(); i++) {
            realTimeList.add(gson.fromJson(arraymetros.get(i), RealTimeBusesAndMetros.class));
        }

        JsonArray arraybuses = jsonObject.get("ResponseData").getAsJsonObject().get("Buses").getAsJsonArray();
        for (int i = 0; i < arraybuses.size(); i++) {
            realTimeList.add(gson.fromJson(arraybuses.get(i), RealTimeBusesAndMetros.class));
        }
        return realTimeList;
    }

    private String fetch(String urlString) {
        String result = "";
        try {
            URL url = new URL(urlString);
            Scanner sc = new Scanner(url.openStream());
            result = sc.nextLine();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }


    public List<Trip> TripInfo(String originId, String destId, String date, String time) {
        String format = "json";
        String key = System.getenv("PlannerKey");
        String urlString = "http://api.sl.se/api2/TravelplannerV3/trip." + format
                + "?key=" + key
                + "&originId=" + originId
                + "&destId=" + destId
                + "&date=" + date
                + "&time=" + time;

        String result = fetch(urlString);

        Gson gson = new Gson();
        JsonObject jsonObject = new JsonParser().parse(result).getAsJsonObject();
        JsonArray array = jsonObject.get("Trip").getAsJsonArray();
        List<Trip> tripInfo = new ArrayList<>();
        List<Leg> list = new ArrayList<>();

        System.out.println(array.size());
        for (int i = 0; i < array.size(); i++) {
            tripInfo.add(new Trip());
            JsonArray legArray = array.get(i).getAsJsonObject().get("LegList").getAsJsonObject().get("Leg").getAsJsonArray();
            for (int j = 0; j < legArray.size(); j++) {
                JsonObject json = legArray.get(j).getAsJsonObject();
                tripInfo.get(i).legList.add(gson.fromJson(json, Leg.class));
            }
        }
        return tripInfo;
    }
}
