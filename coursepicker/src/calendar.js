import React, { Component } from 'react';
import Popup from 'react-popup';
import Timeline from './timeline.js';
import './calendar.css';
import './Popup.css';

function determineTimeDifference(t) {
  var timePeriod = t.split('-');
  var time1 = convertToMinutes(convertToMilitary(timePeriod[0]));
  var time2 = convertToMinutes(convertToMilitary(timePeriod[1]));
  return time2-time1;
}

function convertToMilitary(t) { //format is: "08:30 AM"
  if (t.includes('AM')) {
    return t.replace('AM', '').trim();
  }
  else {
    var timeOnly = t.replace('PM', '').trim();
    var separateTime = timeOnly.split(':')
    if (separateTime[0] !== '12') {
      var newHour = parseInt(separateTime[0], 10) + 12;
      return newHour.toString() + ':' + separateTime[1];
    } else {
      return timeOnly;
      }
    }
  }

function convertToMinutes(t) {
  var time = t.split(':');
  return (parseInt(time[0], 10)*60)+ parseInt(time[1], 10);
}

function getDayIndex(day) {
  var days = ["M", "T", "W", "TH", "F"];
  // if (day.includes('W')) { //only applicable for old parsed-courses file
  //   return 2;
  // }
  // else {
  return days.indexOf(day);
  // }
}

function getHourIndex(startTime) {
  var times = [510, 570, 630, 690, 750, 810, 870, 930, 990, 1050, 1110,
                1170, 1230, 1290, 1350, 1410];
  var convertedTime = convertToMinutes(convertToMilitary(startTime));
  var closestTimeIndex = 0;
  for (var i = 0; i < times.length; i++) {
    if (convertedTime < times[i]) {
      closestTimeIndex = i;
      break;
    }
  }
  var diff = convertedTime - times[closestTimeIndex-1];
  return (closestTimeIndex-1) + (diff/60.0);


}

class Calendar extends Component {

  makeCourseBlock = (course, day, time, index) => {
    var timeDiff = determineTimeDifference(time);
    var dayIndex = getDayIndex(day);
    var hourIndex = getHourIndex(time.split('-')[0]); //only get the first time
    var colorChoices = ['#f7e87f', '#f7cb7f', '#a6cff1', '#b0f1cc', '#f6a2eb',
                    '#f7837f','#7f9df7','#6aa2ec'];
    var divStyle = {
      top: 120 + 37*hourIndex,
      left: 162 + 202*dayIndex,
      height: (timeDiff/60.0) * 38,
      width: 180,
      backgroundColor: colorChoices[index%colorChoices.length]
    };
    return (
        <div className="courseBlock" key={course.crn + day + time}
          style={divStyle} onClick={this.createPopup.bind(this, course, day, time)}>
          <div className="courseTitle">{course.title}</div>
          <div className="courseName">{course.name}</div>
        </div>
    );
  }

    createPopup = (course, day, time) => {

    var content = 'Title: ' + course.title + '\n' + 'Name: ' + course.name + '\n' +
                 'Professor(s): ' + course.professors + '\n' + 'CRN: ' + course.crn +
                 '\n' + 'Time: ' + day + ' ' + time;
    if (day === 'W' && course.alt !== undefined) {
      content += '\n' + 'Alternative Wednesday: ' + course.alt;
    }
    Popup.create({
      title: null,
      content: content,
      buttons: {
        left: [{
          text: 'Delete',
          className: 'danger',
          action: () => {
            this.deleteCourse(course);
            Popup.close();
          }
        }],
        right: [{
          text: 'OK',
          action: function() {
            Popup.close();
          }
        }]
      }
    });
  }

  addCourse = (c, index) => {
    return (
      c.days.map((day, i) => this.makeCourseBlock(c, day, c.times[i], index))
    );
  }

  deleteCourse = (course) => {
    var newCourseList = this.props.courses.filter(c => {
      return c !== course;
    });
    return (
      this.props.removedCourses(newCourseList)
    );
  }


  render() {
    return (
      <div>
        <Timeline />
        {this.props.courses.map((c, index) => this.addCourse(c, index))}
        <Popup className="mm-popup" btnClass="mm-popup__btn"/>
      </div>
    )
  }
}

export default Calendar;