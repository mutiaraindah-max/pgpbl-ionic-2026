import { Service } from '@angular/core';
import { ref, push, onValue } from 'firebase/database';
import { database } from './firebase.service';

@Service()
export class DataService {
  // Save a new point
  savePoint(point: { name: string, coordinates: string, description: string }) {
    const pointsRef = ref(database, 'points');
    return push(pointsRef, point);
  }

  getPoints() {
    const pointsRef = ref(database, 'points');
    return new Promise((resolve, reject) => {
      onValue(pointsRef, (snapshot) => {
        const data = snapshot.val();
        resolve(data);
      }, (error) => {
        reject(error);
      });
    });
  }
}
