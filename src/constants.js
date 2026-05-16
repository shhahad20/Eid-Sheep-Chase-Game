'use strict';

export const CONFIG = {
  CANVAS_W: 800,
  CANVAS_H: 600,
  WORLD_W: 3200,
  WORLD_H: 2400,
  PLAYER_SPEED: 175,
  PLAYER_SPRINT_SPEED: 310,
  STAMINA_MAX: 100,
  STAMINA_DRAIN: 35,
  STAMINA_REGEN: 18,
  SHEEP_BASE_SPEED: 145,
  SHEEP_FLEE_DIST: 210,
  CATCH_DIST: 38,
  LEVEL_TIME: 65,
};

export const COLORS = {
  beige:    '#f8e9d7',
  olive:    '#5b6c30',
  deepBlue: '#005c89',
  burgundy: '#7a1f3d',
  gold:     '#d4af37',
  sand:     '#e8c89a',
  road:     '#6e6e6e',
  sidewalk: '#c8b890',
  white:    '#ffffff',
  black:    '#1a1a2e',
};

export const STATE = {
  MENU:         'MENU',
  PLAYING:      'PLAYING',
  PAUSED:       'PAUSED',
  GAME_OVER:    'GAME_OVER',
  VICTORY:      'VICTORY',
  INSTRUCTIONS: 'INSTRUCTIONS',
  HIGH_SCORES:  'HIGH_SCORES',
  CREDITS:      'CREDITS',
  NAME_ENTRY:   'NAME_ENTRY',
};
