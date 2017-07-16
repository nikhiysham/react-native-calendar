import React, { PureComponent } from "react";
import { Icon } from "react-native-elements";

import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

var dateSelected = [];
var hasOwnProperty = Object.prototype.hasOwnProperty;

export default class Calendar extends PureComponent {
  state = {
    daySelected: null,
    dateArray: [],
    dummyDate: []
  };

  componentWillMount() {
    dateSelected = [];
  }

  static get defaultProps() {
    return {
      date: new Date(),
      onDateSelect: null,
      onPrevButtonPress: null,
      onNextButtonPress: null,
      weekFirstDay: 0,
      dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ]
    };
  }

  static get propTypes() {
    return {
      date: React.PropTypes.object,
      onDateSelect: React.PropTypes.func,
      onPrevButtonPress: React.PropTypes.func,
      onNextButtonPress: React.PropTypes.func,
      dayNames: React.PropTypes.array,
      monthNames: React.PropTypes.array,
      weekFirstDay: React.PropTypes.number,
      categoryQuota: React.PropTypes.number,
      occupiedSlots: React.PropTypes.object
    };
  }

  handleNextButtonPress() {
    // console.log("next");
    if (this.props.onNextButtonPress !== null) {
      this.props.onNextButtonPress();
    }
  }

  handlePrevButtonPress() {
    if (this.props.onPrevButtonPress !== null) {
      this.props.onPrevButtonPress();
    }
  }

  highlightDay(selectedDate) {
    // console.log(selectedDate);
    this.setState({
      daySelected: selectedDate
    });

    let copies = this.state.dateArray.slice(0);

    var dateExist = false,
      indexExist = null;

    if (copies.length > 0) {
      copies.forEach((date, idx) => {
        if (date.getTime() === selectedDate.getTime()) {
          dateExist = true;
          indexExist = idx;
        }
      });
      if (!dateExist) {
        this.setState({
          dateArray: this.state.dateArray.concat(selectedDate)
        });
      } else {
        this.state.dateArray.splice(indexExist, 1);
      }
    } else {
      this.setState({
        dateArray: this.state.dateArray.concat(selectedDate)
      });
    }
  }

  handleDayPress(dateNumber) {
    if (this.props.onDateSelect !== null) {
      const month = this.props.date.getMonth();
      const year = this.props.date.getFullYear();
      const selectedDate = new Date(year, month, dateNumber);

      // 1) Date array to be render at component rendering
      this.highlightDay(selectedDate);

      // 2) Date array to be render at UI
      var dateExist = false,
        indexExist = null;

      if (dateSelected.length > 0) {
        dateSelected.forEach((date, idx) => {
          if (date.getTime() === selectedDate.getTime()) {
            dateExist = true;
            indexExist = idx;
          }
        });

        if (!dateExist) {
          dateSelected.push(selectedDate);
        } else {
          dateSelected.splice(indexExist, 1);
        }
      } else {
        dateSelected.push(selectedDate);
      }
      this.props.onDateSelect(dateSelected);
    }
  }

  renderCalendarDay(index, dateNumber) {
    const weekDay = (index + this.props.weekFirstDay) % 7;
    const isWeekend = weekDay === 0 || weekDay === 6;

    const today = new Date();
    const todayBeforeNoon = new Date();
    todayBeforeNoon.setHours(12);

    const isBeforeNoonToday =
      this.props.date.getDate() === dateNumber &&
      this.props.date.getMonth() === today.getMonth() &&
      this.props.date.getFullYear() === today.getFullYear() &&
      this.props.date.getHours() < todayBeforeNoon.getHours();
    const isToday =
      this.props.date.getDate() === dateNumber &&
      this.props.date.getMonth() === today.getMonth() &&
      this.props.date.getFullYear() === today.getFullYear();

    var next2MonthDate = new Date();
    next2MonthDate.setMonth(next2MonthDate.getMonth() + 2);

    const month = this.props.date.getMonth();
    const year = this.props.date.getFullYear();
    const day = new Date(year, month, dateNumber);

    var isSelected = false;
    // if (this.state.daySelected) {
    //   isSelected = day.getTime() === this.state.daySelected.getTime();
    //   // console.log(isSelected);
    // }
    // console.log("dateArray:", this.state.dateArray);

    if (this.state.dateArray.length > 0) {
      this.state.dateArray.forEach((date, idx) => {
        if (date.getTime() === day.getTime()) {
          isSelected = true;
        }
      });
    }

    var disableDate = false;
    var unAvailableDate = false,
      leftQuota = this.props.categoryQuota,
      bookByMe = false;

    if (day.getTime() < today.getTime() && !isBeforeNoonToday) {
      disableDate = true;
    } else if (day.getTime() > next2MonthDate.getTime()) {
      disableDate = true;
    } else {
      for (var key in this.props.occupiedSlots) {
        if (hasOwnProperty.call(this.props.occupiedSlots, key)) {
          if (dateNumber == key) {
            var quotaFill = this.props.occupiedSlots[key].cnt;
            leftQuota = this.props.categoryQuota - quotaFill;
            bookByMe = this.props.occupiedSlots[key].bookByMe;
          }
        }
      }

      if (leftQuota == 0) {
        disableDate = true;
        unAvailableDate = true;
      }
    }

    // console.log("occupiedSlots: ", this.props.occupiedSlots);

    return (
      <View key={dateNumber} style={styles.dayOuter}>
        <TouchableOpacity
          onPress={() => this.handleDayPress(dateNumber)}
          disabled={disableDate || bookByMe}
        >
          <View
            style={[
              styles.dayInner,
              disableDate ? styles.dateDisabled : styles.availableDate,
              isSelected ? styles.selectedDay : {},
              unAvailableDate ? styles.unAvailableDate : {},
              bookByMe ? styles.bookByMe : {}
            ]}
          >
            {bookByMe &&
              <Icon
                name="checkbox-blank-circle"
                type="material-community"
                size={10}
                color={"#F7708B"}
                style={{
                  position: "absolute",
                  zIndex: 10,
                  top: 28,
                  left: 25
                }}
              />}
            <Text
              style={[
                styles.dayText,
                disableDate
                  ? styles.dateDisabledText
                  : styles.availableDateText,
                isSelected ? styles.selectedDayText : {},
                unAvailableDate ? styles.shadedText : {}
              ]}
            >
              {dateNumber}
            </Text>
          </View>
          {!disableDate &&
            <View
              style={{
                backgroundColor: "#FFC300",
                position: "absolute",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ color: "black", padding: 3, fontSize: 11 }}>
                {leftQuota}
              </Text>
            </View>}
        </TouchableOpacity>
      </View>
    );
  }

  renderCalendarDayEmpty(dateNumber) {
    return (
      <View key={dateNumber} style={styles.dayOuter}>
        <View style={styles.dayInner}>
          <Text style={styles.dayText}> </Text>
        </View>
      </View>
    );
  }

  renderCalendarWeek(startDateNumber, weekOffset, daysLeft) {
    const days = [];
    const weekKey = startDateNumber;
    // Render start empty day offset
    for (let i = 0; i < weekOffset; i++) {
      days.push(this.renderCalendarDayEmpty(-weekOffset + i));
    }

    let i = weekOffset;

    for (; i < 7 && daysLeft > 0; i++) {
      days.push(this.renderCalendarDay(i, startDateNumber++));
      daysLeft--;
    }

    // Render end empty day offset
    for (; i < 7; i++) {
      // console.log(i);
      days.push(this.renderCalendarDayEmpty(startDateNumber++));
    }

    return (
      <View style={styles.week} key={weekKey}>
        {days}
      </View>
    );
  }

  renderBar() {
    const month = this.props.date.getMonth();
    const year = this.props.date.getFullYear();
    const monthName = this.props.monthNames[month];
    return (
      <View style={styles.bar}>
        <TouchableOpacity
          style={styles.barTouchable}
          onPress={() => this.handlePrevButtonPress()}
        >
          <View style={[styles.barButton, styles.barButtonPrev]}>
            <Icon
              type="material-community"
              name="arrow-left-bold"
              size={20}
              color={"black"}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.barMonth}>
          <Text style={styles.barText}>
            {monthName + " "}
          </Text>
        </View>

        <View style={styles.barYear}>
          <Text style={styles.barText}>
            {year}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.barTouchable}
          onPress={() => this.handleNextButtonPress()}
        >
          <View style={[styles.barButton, styles.barButtonNext]}>
            <Icon
              type="material-community"
              name="arrow-right-bold"
              size={20}
              color={"black"}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderDayNames() {
    const elements = [];

    for (let i = 0; i < 7; i++) {
      const dayIndex = (this.props.weekFirstDay + i) % 7;

      elements.push(
        <View key={i} style={styles.dayInner}>
          <Text style={[styles.shadedText, styles.dayText]}>
            {this.props.dayNames[dayIndex]}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.week}>
        {elements}
      </View>
    );
  }

  render() {
    const date = this.props.date;
    let monthFirstDayOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).getDay();
    let daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    let startDateNumber = 1;

    const weeks = [];

    // Show top date
    if (monthFirstDayOfWeek !== 0) {
      weeks.push(
        this.renderCalendarWeek(
          startDateNumber,
          monthFirstDayOfWeek,
          daysInMonth
        )
      );
      daysInMonth = daysInMonth - (7 - monthFirstDayOfWeek) % 7;
      startDateNumber = startDateNumber + (7 - monthFirstDayOfWeek) % 7;
    }

    // Show bottom date
    while (daysInMonth > 0) {
      weeks.push(this.renderCalendarWeek(startDateNumber, 0, daysInMonth));
      startDateNumber += 7;
      daysInMonth -= 7;
    }

    return (
      <View style={[styles.calendar]}>
        {this.renderBar()}
        {this.renderDayNames()}
        {weeks}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: "white"
  },

  week: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },

  dayOuter: {
    flex: 1
  },

  dateDisabled: {
    backgroundColor: "#E9E9EC"
  },

  dateDisabledText: {
    color: "#888"
  },

  dayInner: {
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingLeft: 8,
    backgroundColor: "white",
    borderBottomWidth: 3,
    borderStyle: "solid",
    borderColor: "white"
  },

  availableDate: {
    backgroundColor: "green"
  },

  unAvailableDate: {
    backgroundColor: "red"
  },

  bookByMe: {
    backgroundColor: "#220309"
  },

  availableDateText: {
    color: "white"
  },

  selectedDay: {
    backgroundColor: "#C7F7B3"
  },

  selectedDayText: {
    color: "#888"
  },

  todayDayInner: {
    borderColor: "#BF360C"
  },

  dayText: {
    textAlign: "right"
    // fontWeight: "bold"
  },

  dayWeekendText: {
    color: "#BF360C"
  },

  bar: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  barText: {
    color: "#424242",
    fontWeight: "bold"
  },

  barButton: {
    backgroundColor: "white",
    padding: 10
  },

  shadedText: {
    color: "#AAAAAA",
    fontWeight: "bold"
  }
});
