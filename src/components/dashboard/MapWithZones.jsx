"use client";
import { MapContainer, TileLayer, Polygon, Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const droneIcon = new L.Icon({
    iconUrl: '/images/drone-icon.svg',
    iconSize: [45, 45],
});

const droneLaunchCoords = [39.5, -8];

const zones = [
    {
        id: "zone-1",
        name: "Alentejo Zona A",
        coords: [
            [38.5, -8.5],
            [38.6, -8.5],
            [38.6, -8.4],
            [38.5, -8.4],
        ],
    },
    {
        id: "zone-2",
        name: "Serra da Estrela Zona",
        coords: [
            [40.3, -7.7],
            [40.4, -7.7],
            [40.4, -7.6],
            [40.3, -7.6],
        ],
    },
];

export default function MapWithZones({ onZoneSelected, droneTarget, onDroneAnimationEnd }) {
    const [selectedZone, setSelectedZone] = useState(null);
    const [dronePos, setDronePos] = useState(null);

    // Trigger drone animation when droneTarget changes
    useEffect(() => {
        if (droneTarget) {
            flyDrone(droneTarget);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [droneTarget]);

    const flyDrone = (targetCoords) => {
        setDronePos(droneLaunchCoords);
        const steps = 100;
        let currentStep = 0;
        const latStep = (targetCoords[0] - droneLaunchCoords[0]) / steps;
        const lngStep = (targetCoords[1] - droneLaunchCoords[1]) / steps;

        const interval = setInterval(() => {
            currentStep++;
            setDronePos([
                droneLaunchCoords[0] + latStep * currentStep,
                droneLaunchCoords[1] + lngStep * currentStep,
            ]);

            if (currentStep >= steps) {
                clearInterval(interval);
                // Drone animation finished; trigger callback.
                onDroneAnimationEnd && onDroneAnimationEnd();
            }
        }, 30);
    };

    const handleZoneClick = (zone) => {
        setSelectedZone(zone);
        // Immediately trigger callback to show the impact panel (no drone animation yet)
        onZoneSelected?.(zone);
    };

    return (
        <div className="w-full h-[600px] rounded-xl shadow-lg overflow-hidden">
            <MapContainer center={[39.5, -8]} zoom={7} scrollWheelZoom={true} className="w-full h-full z-0">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {zones.map((zone) => (
                    <Polygon
                        key={zone.id}
                        pathOptions={{
                            color: selectedZone?.id === zone.id ? "#2e7d32" : "#4caf50",
                            fillOpacity: 0.5,
                        }}
                        positions={zone.coords}
                        eventHandlers={{
                            click: () => handleZoneClick(zone),
                        }}
                    />
                ))}
                {dronePos && <Marker position={dronePos} icon={droneIcon} />}
            </MapContainer>
        </div>
    );
}
