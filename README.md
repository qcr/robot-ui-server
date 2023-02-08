# Robot User Interface (UI) Server

## Description
This repository contains a server that allows ROS interfacing to the QCR platforms site. The server, when included with a suitable ROS package in a catkin workspace, can be launched to connect to a [QCR platform UI](https://platforms.qcr.ai/). This can enable functionality such as:

- Starting and/or stopping your ROS package from the UI
- Enable a convenient way to demonstrate the functionality of your ROS package from a remote location (i.e., the UI can talk to your package from another computer/location)
- Enable debugging information (i.e., vision capture, etc.) to be easily viewed from a remote location (or on site depending on your use-case)

## Installing NodeJs on Ubuntu
*NOTE: Tested on Ubuntu 20.04*

1. Install directly from apt: 
```bash
sudo apt install nodejs npm
```
2. Globally install the node version management tool:
```bash
sudo npm install -g n
```
3. Update to the latest LTS:
```bash
sudo n lts
```

## Setup Instructions
The following instructions must be followed to allow the server to run as intended

1. Follow the NodeJs installation instructions as described [above](#installing-nodejs-on-ubuntu)
2. Create a catkin workspace at a directory of your choosing. This instruction set will assume you are in your home directory for simplicity:
```bash
# Make a catkin_ws directory with a src folder (you will clone in the repo at this location)
mdkir ~/catkin_ws/src; cd ~/catkin_ws/src
git clone git@github.com:qcr/robot-ui-server.git; cd robot-ui-server

# Run an npm install to install the project (inside the cloned folder)
npm install

# Move back into the catkin_ws and run a catkin_make to make the ROS package and source the package when complete
cd ~/catkin_ws; catkin_make
source ~/catkin_ws/devel/setup.bash
```
3. The package can then be run using the following command
```bash
rosrun robot_ui_server server
```

## Tailoring the Server to a Distinct Robot Demo
Once you have confirmed the project can be [built](#setup-instructions), additional setup is required to get the server talking to a UI. This is important when a robot is ready for deployment, and you want your package to communicate outwards to the UI.

1. An environment file template (***env-template***) is provided with this package. Copy this and rename it to a new file called ***.env*** as illustrated in the below commands:
```bash
# Enter the robot ui server package if you are not there already
cd ~/catkin_ws/src/robot-ui-server

# Copy and rename the template file (by default, this is not tracked)
cp env-template .env
```
2. Open the ***.env*** file in an editor of your choice and add data to the following:

    - ***ID:*** this is the ID that the QCR Platforms UI will use to communicate to this server. This can be anything of your choosing.
    - ***TOKEN:*** A generated Token that is provided when registering your server with the [QCR platform UI](https://platforms.qcr.ai/). ***INSTRUCTIONS TBD***

NOTE: the above steps should be repeated if the demonstration changes, etc.

## Contact Information
If you have any inquires into the usage of this platform, please send your queries to robotics.ref@qut.edu.au and we will be in contact with you at our earliest convenience.  

If you have any issues using this package, please do not hesitate to leave an issue using the Github issue tracking system.
