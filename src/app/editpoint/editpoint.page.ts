
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: false,
})
export class EditpointPage implements OnInit {

  map!: L.Map;
  key = '';
  name = '';
  coordinates = '';
  description = '';

  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  constructor() { }

  ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') || '';
    this.loadPoint();
  }

  async loadPoint() {
    try {
      const point: any = await this.dataService.getPoint(this.key);

      if (!point) {
        throw new Error('Data titik tidak ditemukan.');
      }

      this.name = point.name;
      this.coordinates = point.coordinates;
      this.description = point.description || '';

      // Konfigurasi ikon marker
      const iconRetinaUrl = 'assets/icon/marker-icon-2x.png';
      const iconUrl = 'assets/icon/marker-icon.png';
      const shadowUrl = 'assets/icon/marker-shadow.png';

      const iconDefault = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });

      L.Marker.prototype.options.icon = iconDefault;

      // Load map
      const coords = point.coordinates.split(',').map(Number);

      this.map = L.map('mapedit').setView(
        coords as L.LatLngExpression,
        13
      );

      // Basemap OpenStreetMap
      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      );

      // Esri World Imagery
      const esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri'
        }
      );

      osm.addTo(this.map);

      // Layer control
      const baseMaps = {
        'OpenStreetMap': osm,
        'Esri World Imagery': esri
      };

      L.control.layers(baseMaps).addTo(this.map);

      const tooltip =
        'Drag the marker or move the map<br>to change the coordinates<br>of the location';

      const marker = L.marker(
        coords as L.LatLngExpression,
        { draggable: true }
      );

      marker.addTo(this.map);
      marker.bindPopup(tooltip);
      marker.openPopup();

      // Dragend marker
      marker.on('dragend', (e) => {
        const latlng = e.target.getLatLng();
        const lat = latlng.lat.toFixed(9);
        const lng = latlng.lng.toFixed(9);

        // Update coordinates input
        this.coordinates = lat + ',' + lng;
      });

      setTimeout(() => {
        this.map.invalidateSize();
        this.map.setView(
          coords as L.LatLngExpression,
          13
        );
      }, 300);

    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Load Failed',
        message: error.message || 'Gagal memuat data titik.',
        buttons: ['OK'],
      });

      await alert.present();
    }
  }

  async save() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.updatePoint(this.key, {
          name: this.name,
          coordinates: this.coordinates,
          description: this.description
        });

        this.navCtrl.back();

      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK'],
        });

        await alert.present();
      }
    }
  }

}
