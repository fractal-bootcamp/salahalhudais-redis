"use client";

import { io } from "socket.io-client";

// Create a socket connection to the server
export const socket = io();