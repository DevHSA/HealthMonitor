import "./App.css";
import axios from "axios";
import React from "react";
import moment from "moment";
import { Table, Tag, Space, message } from "antd";
import { Line } from "@ant-design/plots";

const baseURL = "https://5tayx5prn2.execute-api.us-east-1.amazonaws.com/test";

// axios.defaults.headers.common["x-api-key"] =
//   "6qqUIHybLe8K8ks2U5ElU42u7hUYmcpo11Iy4XTT";

var config = {
  method: "get",
  url: "https://21fcjfjhv5.execute-api.us-east-1.amazonaws.com/getData",
  headers: {
    "x-api-key": "HFBvEBCc784vuQ9ldMrjN5yJaNLs30Uj705MpH9z",
  },
};

const columns = [
  {
    title: "Client ID",
    dataIndex: "clientID",
    key: "clientID",
    render: (text) => <a>{text}</a>,
    filters: [
      {
        text: "Client 11",
        value: 11,
      },
      {
        text: "Client 12",
        value: 12,
      },
    ],
    onFilter: (value, record) => record.clientID === value,
  },
  {
    title: "Timestamp",
    dataIndex: "timestamp",
    key: "timestamp",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.timestamp - b.timestamp,
    render: (ts) => moment.unix(ts).format("dddd, MMMM Do, YYYY h:mm:ss A"),
  },
  {
    title: "Contact",
    dataIndex: "contact",
    key: "contact",
  },
  {
    title: "Heart Rate",
    dataIndex: "heartrate",
    key: "heartrate",
  },
  {
    title: "Temperature",
    dataIndex: "temperature",
    key: "temperature",
  },

  // {
  //   title: 'Tags',
  //   key: 'tags',
  //   dataIndex: 'tags',
  //   render: tags => (
  //     <>
  //       {tags.map(tag => {
  //         let color = tag.length > 5 ? 'geekblue' : 'green';
  //         if (tag === 'loser') {
  //           color = 'volcano';
  //         }
  //         return (
  //           <Tag color={color} key={tag}>
  //             {tag.toUpperCase()}
  //           </Tag>
  //         );
  //       })}
  //     </>
  //   ),
  // },
  // {
  //   title: 'Action',
  //   key: 'action',
  //   render: (text, record) => (
  //     <Space size="middle">
  //       <a>Invite {record.name}</a>
  //       <a>Delete</a>
  //     </Space>
  //   ),
  // },
];

const App = () => {
  const [post, setPost] = React.useState(null);
  const [nullVal, setNullVal] = React.useState(false);
  const [chart, setChart] = React.useState([
    {
      temperature: 25.625,
      clientID: 11,
      heartrate: 127,
      contact: 9489575958,
      timestamp: "Friday, May 6th, 2022 7:43:36 AM",
    },
  ]);
  const [chartH, setChartH] = React.useState([
    {
      temperature: 25.625,
      clientID: 11,
      heartrate: 127,
      contact: 9489575958,
      timestamp: "Friday, May 6th, 2022 7:43:36 AM",
    },
  ]);

  React.useEffect(() => {
    const getData = () => {
      // axios.get(baseURL,{ headers: { 'x-api-key': "6qqUIHybLe8K8ks2U5ElU42u7hUYmcpo11Iy4XTT" } }).then((response) => {

      axios(config).then((response) => {
        setPost(response.data.Items);

        // console.log(response.data.Items);
        let rawData = response.data.Items;
        let data = response.data.Items.map((item) => {
          return {
            ...item,
            timestamp: moment
              .unix(item.timestamp)
              .format("dddd, MMMM Do, YYYY h:mm:ss A"),
          };
        });

        let tempData = data.map((item) => {
          return {
            clientID: "Client " + item.clientID.toString(),
            temperature: item.temperature,
            timestamp: item.timestamp,
          };
        });
        let heartData = data.map((item) => {
          return {
            clientID: "Client " + item.clientID.toString(),
            heartrate: item.heartrate,
            timestamp: item.timestamp,
          };
        });

        let dataClient11 = tempData.filter(
          (item) => item.clientID === "Client 11"
        );
        let dataClient12 = tempData.filter(
          (item) => item.clientID === "Client 12"
        );

        console.log(data);

        console.log(tempData);
        console.log(heartData);

        // calculate average of last 5 readings
        let tempAvg11 = dataClient11.slice(1).slice(-5);
        let tempAvg12 = dataClient12.slice(1).slice(-5);

        console.log(tempAvg11);
        console.log(tempAvg12);

        let average11 = tempAvg11.reduce(function (a, b) {
          return a + b.temperature;
        }, 0);
        let average12 = tempAvg12.reduce(function (a, b) {
          return a + b.temperature;
        }, 0);

        average11 = average11 / 5;
        average12 = average12 / 5;

        console.log(average11);
        console.log(average12);

        let apiParams = {};

        if (average11 > 27) {
          apiParams = {
            phNo: "9489575958",
            message: "temperature Abnormality detected",
            clientID: "Client 11",
            temperature: average11,
          };

          axios
            .post("http://localhost:5000/sendMessage", apiParams)
            .then((response) => {
              message.success("Message sent to Client 11 Phone 9489575958");
              console.log(response);
            });
        }

        if (average12 > 27) {
          apiParams = {
            phNo: "9489575958",
            message: "Temperature Abnormality detected",
            clientID: "Client 12",
            temperature: average12,
          };

          axios
            .post("http://localhost:5000/sendMessage", apiParams)
            .then((response) => {
              message.success("Message sent to Client 12 Phone 9489575958");
              console.log(response);
            });
        }

        setChart({
          data: tempData,
          padding: "auto",
          xField: "timestamp",
          yField: "temperature",
          seriesField: "clientID",
          xAxis: {
            tickCount: 10,
          },
          slider: {
            start: 0,
            end: 1,
          },
          color: ["#1979C9", "#D62A0D", "#FAA219"],
        });

        setChartH({
          data: heartData,
          padding: "auto",
          xField: "timestamp",
          yField: "heartrate",
          seriesField: "clientID",
          xAxis: {
            tickCount: 10,
          },
          slider: {
            start: 0,
            end: 1,
          },
          color: ["#1979C9", "#D62A0D", "#FAA219"],
        });

        setNullVal(true);
      });
    };

    getData();
    const interval = setInterval(() => getData(), 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          border: "solid 0px",
          width: "100%",
          textAlign: "center",
          padding: "10px",
        }}
      >
        <h2>Health Monitoring System Dashboard</h2>
      </div>
      <div style={{ border: "solid 0px", width: "56%", padding: "10px" }}>
        {nullVal && (
          <Table bordered={true} columns={columns} dataSource={post} />
        )}
      </div>
      <div
        style={{
          width: "39%",
          height: "300px",
          position: "absolute",
          right: "40px",
          top: "65px",
          textAlign: "center",
        }}
      >
        <b>Temperature</b>
        {chart && nullVal && <Line {...chart} />}
      </div>

      <div
        style={{
          width: "39%",
          height: "300px",
          position: "absolute",
          right: "40px",
          top: "400px",
          textAlign: "center",
        }}
      >
        <b>Heart Rate</b>
        {chartH && nullVal && <Line {...chartH} />}
      </div>
    </div>
  );
};

export default App;
