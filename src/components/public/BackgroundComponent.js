import React from "react";
import * as bgVideo from "../../assets/video/project-canary.mp4";
import './_bg.scss';

const BackgroundComponent = React.memo(function BackgroundComponent() {
    return  (
        <div className="fullscreen-bg">
            <video loop muted autoPlay className="fullscreen-bg__video">
                <source src={bgVideo} type="video/mp4"/>
            </video>
        </div>
    )
});

export default BackgroundComponent;