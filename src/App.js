import "./App.css";
import { Calendar, message, Select } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import Modal from "antd/lib/modal/Modal";
import { db } from "./firebaseConfig";
import axios from "axios";

const getColor = (content) => {
  switch (content?.toLowerCase()) {
    case "day":
      return "cornflowerblue";
    case "eve":
      return "yellowgreen";
    case "night":
      return "black";
    case "off":
      return "pink";
    default:
      break;
  }
};

function App() {
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleAddEvent, setVisibleAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState([]);
  // const [currentEvent, setCurrentEvent] = useState([]);
  const [getEventByMonth, setGetEventByMonth] = useState(null);
  const query = new URLSearchParams(window.location.search);
  const code = query.get("code");

  useEffect(() => {
    if (code) {
      const getNotifyToken = async () => {
        try {
          const { data } = await axios.post(
            "https://asia-northeast1-chayen.cloudfunctions.net/notify_covid_track/grantToken",
            {
              code: code,
            },
          );
          if (data) {
            message.success("ลงทะเบียนเรียบร้อยค่า");
          }
        } catch (error) {
          message.error("พังงง");
        }

        // const { data } = await axios.post(
        //   `https://notify-bot.line.me/oauth/token`,
        //   {
        //     grant_type: "authorization_code",
        //     code: code,
        //     redirect_uri: "http://localhost:9000",
        //     client_id: "IH3b8vS68hh6X9MNExzzt3",
        //     client_secret: "lk3iTYBw4LOCyGnVykC1RRjjoGL68UHt9grqbhVO3x8",
        //   },
        // );
        // console.log("data :: ", data);
      };
      getNotifyToken();
    }
  }, [code]);

  useEffect(() => {
    const unsub = db
      .collection("nurse-event")
      .doc(
        `${currentDate.getFullYear()}-${(
          currentDate.getMonth() + 1
        ).toString()}`,
      )
      .onSnapshot((doc) => {
        console.log("doc : ", doc.data());
        setGetEventByMonth(doc.data());
      });
    return () => unsub();
  }, [currentDate]);

  useEffect(() => {
    console.log("selectedDate :: ", selectedDate.getDate());
    const unsub = db
      .collection("nurse-event")
      .doc(
        `${selectedDate.getFullYear()}-${(
          selectedDate.getMonth() + 1
        ).toString()}`,
      )
      .onSnapshot((doc) => {
        const event = doc.data()?.[selectedDate.getDate()];
        if (event) {
          setSelectedEvent(event.map((item) => item.content));
        } else {
          setSelectedEvent([]);
        }
      });
    return () => unsub();
  }, [selectedDate]);

  function getListData(value) {
    let listData;
    if (
      value.month() === currentDate.getMonth() &&
      value.year() === currentDate.getFullYear()
    ) {
      switch (value.date()) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 28:
        case 29:
        case 30:
        case 31:
          listData = getEventByMonth?.[value.date()];
          break;

        default:
      }
    }
    return listData || [];
  }

  function dateCellRender(value) {
    const listData = getListData(value);
    return listData.map((item, index) => {
      return (
        <div
          style={{ color: getColor(item.content), fontWeight: "bold" }}
          key={item.content + index + Math.random() * 999}
          // onClick={() => setVisibleAddEvent(true)}
        >
          {item.content}
        </div>
      );
    });
  }

  return (
    <div className="App" style={{ marginTop: "1rem" }}>
      <h2>My Duty</h2>
      <Calendar
        fullscreen={false}
        dateCellRender={dateCellRender}
        mode="month"
        onSelect={(date) => {
          if (
            selectedDate.getMonth() !==
              new Date(moment(date).format("MM/DD/YYYY")).getMonth() ||
            selectedDate.getFullYear() !==
              new Date(moment(date).format("MM/DD/YYYY")).getFullYear()
            //   ||
            // selectedDate.getMonth() ===
            //   new Date(moment(date).format("MM/DD/YYYY")).getMonth()
          ) {
            return;
          } else {
            setSelectedDate(new Date(moment(date).format("MM/DD/YYYY")));
            setVisibleAddEvent(true);
          }
        }}
        // onChange={(date) => {
        //   console.log("change");
        // }}
        // onPanelChange={(date) => {}}
      />
      {/* )} */}
      <Modal
        title={`วันที่ ${new Intl.DateTimeFormat("en-US").format(
          selectedDate,
        )}`}
        visible={visibleAddEvent}
        onOk={() => {
          try {
            const selected = moment(selectedDate).format("MM/DD/YYYY");
            const selectMonth = new Date(selected).getMonth() + 1;
            const selectDate = new Date(selected).getDate();
            const selectYear = new Date(selected).getFullYear();
            const newEvent = selectedEvent.map((item) => {
              return { content: item };
            });
            console.log("newEvent : ", newEvent);
            const formatEvent = {
              ...getEventByMonth,
              [selectDate]:
                newEvent?.length <= 0
                  ? []
                  : getEventByMonth?.[selectDate]
                  ? [...getEventByMonth?.[selectDate], ...newEvent]
                  : [...newEvent],
            };
            db.collection("nurse-event")
              .doc(`${selectYear}-${selectMonth}`)
              .set(formatEvent);

            message.success("เพิ่มสำเร็จ");
            setSelectedEvent([]);
            setVisibleAddEvent(false);
          } catch (error) {}
        }}
        onCancel={() => setVisibleAddEvent(false)}
      >
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="เลือก Event"
          // defaultValue={["china"]}
          value={selectedEvent}
          onChange={(value) => {
            setSelectedEvent(value);
          }}
          optionLabelProp="label"
        >
          {[
            { label: "Day", value: "day" },
            { label: "Eve", value: "eve" },
            { label: "Night", value: "night" },
            {
              label: "Off",
              value: "off",
            },
          ].map((item) => {
            return (
              <Select.Option value={item.value} label={item.label}>
                {item.label}
              </Select.Option>
            );
          })}
        </Select>
      </Modal>
    </div>
  );
}

export default App;
