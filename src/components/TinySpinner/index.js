import React, { Component } from 'react';
import './tiny-spinner.component.css';

const TinySpinner = function() {
  return (
    <div className="tiny-spinner">
      <div className="bounce1" />
      <div className="bounce2" />
      <div className="bounce3" />
    </div>
  );
};

export default TinySpinner;
