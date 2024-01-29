import "./style.css"
import Draw, { createBox, createRegularPolygon } from "ol/interaction/Draw.js";
import Map from "ol/Map.js";
import Polygon from "ol/geom/Polygon.js";
import View from "ol/View.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";

let selectedTool = "None";

const toolBtns = document.querySelectorAll(".tool");

const raster = new TileLayer({ source: new OSM(),});

const source = new VectorSource({ wrapX: false });

const vector = new VectorLayer({ source: source,});

const map = new Map({
  layers: [raster, vector],
  target: "map",
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});

let draw; // global so we can remove it later
const addInteraction = () => {
  if (selectedTool !== "None") {
    let geometryFunction;
    if (selectedTool === "rectangle") {
      selectedTool = "Circle";
      geometryFunction = createRegularPolygon(4);
    } else if (selectedTool === "circle") {
      selectedTool = "Circle";
      geometryFunction = createBox();
    } else if (selectedTool === "triangle") {
      selectedTool = "Circle";
      geometryFunction = function (coordinates, geometry) {
        const center = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        const dx = center[0] - last[0];
        const dy = center[1] - last[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        const rotation = Math.atan2(dy, dx);
        const newCoordinates = [];
        const numPoints = 12;
        for (let i = 0; i < numPoints; ++i) {
          const angle = rotation + (i * 2 * Math.PI) / numPoints;
          const fraction = i % 2 === 0 ? 1 : 0.5;
          const offsetX = radius * fraction * Math.cos(angle);
          const offsetY = radius * fraction * Math.sin(angle);
          newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
        }
        newCoordinates.push(newCoordinates[0].slice());
        if (!geometry) {
          geometry = new Polygon([newCoordinates]);
        } else {
          geometry.setCoordinates([newCoordinates]);
        }
        return geometry;
      };
    }
    draw = new Draw({
      source: source,
      type: selectedTool,
      geometryFunction: geometryFunction,
    });
    map.addInteraction(draw);
  }
};

toolBtns.forEach((btn) => {
  
  btn.addEventListener("click", () => {
    // adding click event to all tool option
    // removing active class from the previous option and adding on current clicked option
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
    console.log(btn.id);
    map.removeInteraction(draw)
    addInteraction();
  });
});

/**
 * Handle change event.
 */
// typeSelect.onchange = () => {
//   map.removeInteraction(draw);
//   addInteraction();
// };


// document.getElementById("undo").addEventListener("click", () => {
//   draw.removeLastPoint();
// });

addInteraction();

