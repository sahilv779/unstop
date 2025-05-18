import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hotel-reservation';

  rooms: Room[] = this.generateRooms();
  roomCount: number = 1;

  calculateTravelTime(room1: Room, room2: Room): number {
    if (room1.floor === room2.floor) {
      return Math.abs(room1.position - room2.position);
    }
    return (Math.abs(room1.floor - room2.floor) * 2)
      + room1.position + room2.position;
  }

  findOptimalRooms(roomCount: number): Room[] {
    const optimalFloor: number = this.getOptimalFloor(roomCount);

    return optimalFloor > 0 ?
      this.getAvailableRoomsByFloor(optimalFloor, roomCount) :
      this.getOptimalMultiFloorRooms(roomCount);
  }

  generateRooms(): Room[] {
    const rooms: Room[] = [];

    for (let floor = 1; floor <= 9; floor++) {
      for (let roomNum = 1; roomNum <= 10; roomNum++) {
        rooms.push({
          number: floor * 100 + roomNum,
          floor: floor,
          booked: false,
          position: roomNum
        });
      }
    }

    for (let roomNum = 1; roomNum <= 7; roomNum++) {
      rooms.push({
        number: 1000 + roomNum,
        floor: 10,
        booked: false,
        position: roomNum
      });
    }
    return rooms;
  }

  getRoomsByFloor(floor: number): Room[] {
    return this.rooms.filter(room => room.floor === floor);
  }

  randomizeOccupancy(): void {
    this.rooms.forEach(room => {
      room.booked = Math.random() < 0.3;
    });
  }

  resetAllBookings(): void {
    this.rooms.forEach(room => {
      room.booked = false;
    });
  }

  bookOptimalRooms(): void {
    const optimalRooms = this.findOptimalRooms(this.roomCount);
    if (optimalRooms.length === 0) {
      alert('Not enough available rooms');
      return;
    }
    optimalRooms.forEach(room => room.booked = true);
  }

  private getOptimalFloor(roomCount: number): number {
    for (let floor = 1; floor <= 10; floor++) {
      const roomsOnFloor = this.getRoomsByFloor(floor);
      const bookedRooms = roomsOnFloor.filter(room => room.booked).length;
      if (roomsOnFloor.length - bookedRooms >= roomCount) {
        return floor;
      }
    }

    return -1;
  }

  private getOptimalMultiFloorRooms(roomCount: number) {
    let optimalRooms: Room[] = [];
    let minTravelTime = Infinity;
    let availableRooms: Room[] = this.rooms.filter(room => !room.booked);

    const sortedAvailableRooms = [...availableRooms].sort((a, b) => {
      return a.number - b.number;
    });

    for (let i = 0; i <= sortedAvailableRooms.length - roomCount; i++) {
      const currentRooms = sortedAvailableRooms.slice(i, i + roomCount);
      const travelTime = this.calculateTravelTime(currentRooms[0], currentRooms[currentRooms.length - 1]);

      if (travelTime < minTravelTime) {
        minTravelTime = travelTime;
        optimalRooms = currentRooms;
      }
    }

    return optimalRooms;
  }

  private getAvailableRoomsByFloor(optimalFloor: number, roomCount: number): Room[] {
    const roomsOnFloor = this.getRoomsByFloor(optimalFloor);
    const availableRooms = roomsOnFloor.filter(room => !room.booked);

    if (availableRooms.length >= roomCount) {
      return availableRooms.slice(0, roomCount);
    } else {
      return [];
    }
  }
}

interface Room {
  number: number;
  floor: number;
  booked: boolean;
  position: number;
}

