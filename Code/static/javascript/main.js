// Main code for the Black Box WebUI

//Global Variables
var recordingStatus = false;
var velChart;
var latAccChart;
var vertAccChart;
var heightChart;
var velChartData = [];
var latAccChartData = [];
var vertAccChartData = [];
var heightChartData = [];

//runs when window loads
window.onload = function() {
  $.ajax({
    url:'/onload_data',
    async:false,
    dataType:'json',
    success: function(data) {recordingStatus=data.recordingStatus;}
  });
  getBattery();
  initCharts();
  alert("Do not look at this while operating a motor vehicle")
}

function recordButtonClicked() {
  recordingStatus = !recordingStatus;
  console.log("Recording: "+recordingStatus)
  webpageIndexPost();
  if(recordingStatus) {
    clearCharts();
    document.getElementById('recordButton').innerText = "Stop Recording";
    setTimeout(function() {initCharts()}, (1/parseFloat(document.getElementById('pollingInterval').value))*1000 + 250);
    return true;
  }
  else {
    document.getElementById('recordButton').innerText = "Start Recording";
    return false;
  }
}

function clearDatabaseButtonClicked() {
  if(confirm('This will delete all data in the database. This is irreversable. Click "OK" to delete the data.')) {
    $.post("/cleardb", {clear_confirmation:true});
    document.getElementById('liveVelocity').innerText = "NULL";
    document.getElementById('liveHeight').innerText = "NULL";
    document.getElementById('liveLatAcc').innerText = "NULL";
    document.getElementById('liveVertAcc').innerText = "NULL";
    setTimeout(function() {
      clearCharts();
      initCharts();
    }, (1/parseFloat(document.getElementById('pollingInterval').value))*1000);
  }
}

function shutdownButtonClicked() {
  if(confirm('This will shut down the Black Box. Press OK to continue')) {
    $.post("/shutdown", {shutdown_confirmation:true});
  }
}

function pollingRateInputChanged() {
  webpageIndexPost();
}

function webpageIndexPost() {
  $.post( "/", {
    pollingRate: document.getElementById('pollingInterval').value,
    recordingStatus: recordingStatus
  });
}

function initCharts() {
  //chart definitions and settings
  velChart = new CanvasJS.Chart("vel_chart",{
    title:{
      text:"Velocity Chart",
    },
    axisX:{
      valueFormatString: "h:m:s.f",
    },
    backgroundColor: "#ECDBBA",
    data: [{
      lineColor: "#C84B31",
      color: "#191919",
      type: "line",
      dataPoints: velChartData,
    }]
  });
  vertAccChart = new CanvasJS.Chart("vert_acc_chart",{
    title:{
      text:"Vertical Acceleration Chart",
    },
    axisX:{
      valueFormatString: "h:m:s.f",
    },
    backgroundColor: "#ECDBBA",
    data: [{
      lineColor: "#C84B31",
      color: "#191919",
      type: "line",
      dataPoints: vertAccChartData,
    }]
  });
  latAccChart = new CanvasJS.Chart("lat_acc_chart",{
    title:{
      text:"Lateral Acceleration Chart",
    },
    axisX:{
      valueFormatString: "h:m:s.f",
    },
    backgroundColor: "#ECDBBA",
    data: [{
      lineColor: "#C84B31",
      color: "#191919",
      type: "line",
      dataPoints: latAccChartData,
    }]
  });
  heightChart = new CanvasJS.Chart("height_chart",{
    title:{
      text:"Height Chart",
    },
    axisX:{
      valueFormatString: "h:m:s.f",
    },
    backgroundColor: "#ECDBBA",
    data: [{
      lineColor: "#C84B31",
      color: "#191919",
      type: "line",
      dataPoints: heightChartData,
    }]
  });

  //render all charts
  renderCharts();
  updateGUI();
}

function updateGUI() {

    //Update GPS Info
    getGPS();

  if(recordingStatus) {
    $.getJSON('/data', function(jsondata) {
      //Update Charts
      timeArray = jsondata.time.split(/-| |:|\./);
      currentTime = new Date(timeArray[0], timeArray[1], timeArray[2], timeArray[3], timeArray[4], timeArray[5], timeArray[6])
      velChartData.push({x: currentTime, y: jsondata.velocity });
      vertAccChartData.push({x: currentTime, y: jsondata.vertical_acc });
      latAccChartData.push({x: currentTime, y: jsondata.lateral_acc });
      heightChartData.push({x: currentTime, y: jsondata.height });
      renderCharts();

      //Update Live Data Feed
      document.getElementById('liveVelocity').innerText = jsondata.velocity;
      document.getElementById('liveHeight').innerText = jsondata.height;
      document.getElementById('liveLatAcc').innerText = jsondata.lateral_acc;
      document.getElementById('liveVertAcc').innerText = jsondata.vertical_acc;
      document.getElementById('recordButton').innerText = "Stop Recording";
      document.getElementById('pollingInterval').value = jsondata.pollingRate;
      getBattery();
      setTimeout(function() {updateGUI()}, (1/parseFloat(document.getElementById('pollingInterval').value))*1000);
    });
  }

}

function getBattery() {
  $.getJSON('/battery', function(jsonfile) {
    bat_percent = jsonfile.bat_percent.toString();
    charge_status = jsonfile.charge_status.toString();
    document.getElementById('batteryCharge').innerText = bat_percent + "%";
    document.getElementById('chargeStatus').innerText = charge_status;
  });
}

function getGPS() {
  $.getJSON('/gps', function(jsonfile) {
    document.getElementById('liveGPSLat').innerText = jsonfile.gps_lat;
    document.getElementById('liveGPSLon').innerText = jsonfile.gps_lon;
    console.log("GPS Fix: " + jsonfile.fix);
    console.log("Latitude: " + jsonfile.gps_lat);
    console.log("Longitude: " + jsonfile.gps_lon);
    console.log("\n\n")
    if(!jsonfile.fix) { setTimeout(function() { getGPS(); }, 1000); };
  });
};

function renderCharts() {
  velChart.render();
  latAccChart.render();
  vertAccChart.render();
  heightChart.render();
}

function clearCharts() {
  velChartData = [];
  latAccChartData = [];
  vertAccChartData = [];
  heightChartData = [];
}
