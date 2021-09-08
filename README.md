# tp-energy
* Able to get power consumption of children in a power strip, by just knowing their ip address. 
* Building in a email notification for thresholds.

### Requirements
* Need to create a sibling file of `src`s, called `.env`. Inside of the `.env` file we will have: 
```
FILE_PATH=<to where we want energy logs to be dumped to>
POWER_STRIP_IP_ADDRESS=<192.x.x.x> # Assuming we want the powerstrip
BAGGINS_POWER=<192.x.x.x> # A normal plug with no children <optional can just remove it>
LAPTOP_POWER=<192.x.x.x> # A normal plug with no children <optional can just remove it>

EMAIL=<principal email account>
EMAIL_PASSWORD=<password for principal email account's>
EMAIL_PORT=<port for principal email account>
EMAIL_SERVICE=<principal email service>
EMAIL_TO=<whom to send the email notifications to>
```

