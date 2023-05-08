var Flex = {
  type: "flex",
  altText: "timestamp message",
  contents: {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "image",
              url: "https://maps.googleapis.com/maps/api/staticmap?center=40.73061,-73.935242&zoom=18&size=600x400&scale=1&maptype=roadmap&markers=color:red%7C40.73061,-73.935242&key=AIzaSyCkwz5n-MXnd20XDgjoMypSG52PcrGwj9k",
              size: "full",
              aspectMode: "cover",
              aspectRatio: "3:2",
              gravity: "center",
              flex: 1,
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "ตอกบัตรเข้างาน",
                  size: "xs",
                  color: "#ffffff",
                  align: "center",
                  gravity: "center",
                },
              ],
              backgroundColor: "#19A7CE",
              paddingAll: "2px",
              paddingStart: "4px",
              paddingEnd: "4px",
              flex: 0,
              position: "absolute",
              offsetStart: "18px",
              offsetTop: "18px",
              cornerRadius: "100px",
              width: "110px",
              height: "25px",
            },
          ],
        },
      ],
      paddingAll: "0px",
      action: {
        type: "uri",
        uri: "https://www.google.co.th/maps",
      },
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "ระยะทาง 300 เมตรจากคาร์แคร์",
          color: "#ffffffcc",
          size: "sm",
          align: "center",
        },
      ],
      backgroundColor: "#464F69",
      paddingBottom: "3px",
    },
    footer: {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "ตอกบัตรทำงาน",
            uri: "https://liff.line.me/1661054554-bMmJz7AG",
          },
          style: "primary",
          margin: "none",
          color: "#ffffff1a",
          height: "sm",
        },
      ],
      height: "100%",
      backgroundColor: "#464F69",
    },
  },
};

function getGoogleMapsImageUrl(latitude, longitude) {
  const apiKey = `AIzaSyCkwz5n-MXnd20XDgjoMypSG52PcrGwj9k`;
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  const center = `${latitude},${longitude}`;
  const zoom = 19;
  const size = "600x400";
  const scale = 1;
  const mapType = "roadmap";
  const markers = `color:red%7C${center}`;

  const url = `${baseUrl}?center=${center}&zoom=${zoom}&size=${size}&scale=${scale}&maptype=${mapType}&markers=${markers}&key=${apiKey}`;

  return url;
}

function getGoogleMapsUrl(latitude, longitude) {
  const center = `${latitude},${longitude}`;
  const zoom = 19;
  const url = `https://www.google.co.th/maps/@${center},${zoom}z`;

  return url;
}

export function getTimestampFlex(latitude, longitude, distance, timestamp) {
  let flex = JSON.parse(JSON.stringify(Flex));
  let greenColor = "#54B435";
  let blueColor = "#19A7CE";
  let yellowColor = "";

  let imageMapUrl = getGoogleMapsImageUrl(latitude, longitude);
  let googleMapUrl = getGoogleMapsUrl(latitude, longitude);

  let textDistance = `ระยะทาง ${Math.floor(distance * 1000)} เมตรจากคาร์แคร์`;
  let labelColor = blueColor;
  let textLabel = "ตอกบัตร";

  if (timestamp == "") {
    textLabel = "ตอกบัตรเข้างาน";
    labelColor = blueColor;
  } else if (timestamp == "workin") {
    textLabel = "ตอกบัตรออกงาน";
    labelColor = greenColor;
  }

  flex.contents.header.contents[0].contents[0].url = imageMapUrl;
  flex.contents.header.action.uri = googleMapUrl;
  flex.contents.body.contents[0].text = textDistance;
  flex.contents.header.contents[0].contents[1].contents[0].text = textLabel;
  flex.contents.header.contents[0].contents[1].backgroundColor = labelColor;

  return flex;
}
