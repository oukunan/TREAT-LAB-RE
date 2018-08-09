import React, { Component } from "react";
import P5Wrapper from "react-p5-wrapper";
import clm from "clmtrackr";

import pModel from "../model/pmodel.js";
import "react-p5-wrapper/node_modules/p5/lib/addons/p5.dom";

class Face extends Component {
  constructor(props) {
    super(props);
    this.positions = "";
    this.trigHeight = 0;
    this.ypos = 0;
    this.isLine = false;
    this.state = {
      currentCount: 0,
      bendCount: 0,
      sitCount: 0,
      relaxCount: 0,
      isUp: false,
      warn: false
    };
  }

  componentDidMount() {
    this.intervalHeadId = setInterval(this.headUp, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.intervalHeadId);
  }

  sketch = p => {
    let tracker;

    p.setup = function() {
      let video = p.createCapture(p.VIDEO);
      video.size(400, 300);

      p.createCanvas(400, 300);

      tracker = new clm.tracker();
      tracker.init(pModel);
      tracker.start(video.elt);
    };

    p.draw = () => {
      p.clear();
      p.noStroke();

      this.positions = tracker.getCurrentPosition();
      for (let i = 0; i < this.positions.length; i++) {
        p.fill(0, 255, 0);
        p.rect(this.positions[i][0], this.positions[i][1], 3, 3);
        if (i === 20) {
          this.ypos = this.positions[i][1];
        }
        p.stroke("rgb(0,255,0)");
        p.strokeWeight(2);
        this.isLine && p.line(0, this.trigHeight, p.width * 2, this.trigHeight);
      }
    };
  };

  setHeight = () => {
    this.isLine = true;
    this.trigHeight = this.ypos + 15;
    this.setState({ isUp: true, warn: true });
  };

  headUp = () => {
    const { isUp, warn } = this.state;

    if (isUp) {
      if (this.ypos > this.trigHeight && warn) {
        this.timer();
        if (this.state.currentCount > 3) {
          console.log("Your head is bending down");
          this.setState({
            currentCount: 0,
            bendCount: this.state.bendCount + 1,
            warn: false
          });
        }
      }
      if (this.ypos <= this.trigHeight) {
        this.setState({ currentCount: 0, warn: true });
      }
    }

    if (typeof this.positions === "object") {
      this.sitTimer();
    } else {
      this.relaxTimer();
    }
  };

  timer = () => {
    this.setState({
      currentCount: this.state.currentCount + 1
    });
  };

  sitTimer = () => {
    this.setState({
      sitCount: this.state.sitCount + 1
    });
  };

  relaxTimer = () => {
    this.setState({
      relaxCount: this.state.relaxCount + 1
    });
  };

  render() {
    const { bendCount, sitCount, relaxCount } = this.state;
    return (
      <div>
        <P5Wrapper sketch={this.sketch} />
        <button onClick={this.setHeight}>SET HEIGHT</button>
        <h2>Bend count</h2>
        <div>{bendCount}</div>
        <h2>Sit duration</h2>
        <div>{sitCount}</div>
        <h2>Relax duration</h2>
        <div>{relaxCount}</div>
      </div>
    );
  }
}

export default Face;
