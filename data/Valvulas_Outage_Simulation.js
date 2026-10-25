var VALVE_OUTAGE_SIMULATION_DB = {
  "VALV-01": {
    "valveId": "VALV-01",
    "sector": "Recinto Pozo Profundo - Impulsión a Estanque",
    "desc_operativa": "Corte de bombeo de impulsión. No genera corte inmediato a la población mientras el estanque mantenga volumen de regulación.",
    "tipo_corte": "Maniobra Operativa en Fuente",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [],
    "pipesKm": 0.0,
    "pipesCount": 0,
    "affectedCount": 0,
    "consumers": []
  },
  "VALV-02": {
    "valveId": "VALV-02",
    "sector": "Corte General Sistema El Calvario (Cabecera Estanque 50 m³)",
    "desc_operativa": "Corte mayor en salida del estanque. Afecta al 100% de los socios de El Calvario para mantención general de torre o lavado de estanque.",
    "tipo_corte": "Corte General Mayor",
    "recovery_time": "1.5 a 2.5 horas (Presurización general de red)",
    "pipes": [
      "CALV-01",
      "CALV-02",
      "CALV-03",
      "CALV-04",
      "CALV-05",
      "CALV-06",
      "CALV-07",
      "CALV-08",
      "CALV-09",
      "CALV-10",
      "CALV-11",
      "CALV-12",
      "CALV-13",
      "CALV-14"
    ],
    "pipesKm": 15.03,
    "pipesCount": 14,
    "affectedCount": 140,
    "consumers": [
      {
        "id": "ARR-001",
        "type": "arranque",
        "name": "José Muñoz Díaz",
        "meter": "MED-SJ-1001",
        "rut": "8.123.456-1",
        "status": "Al Día",
        "coords": [
          -71.891046,
          -36.85456
        ]
      },
      {
        "id": "ARR-002",
        "type": "arranque",
        "name": "Carlos Rojas Contreras",
        "meter": "MED-SJ-1002",
        "rut": "8.246.912-2",
        "status": "Al Día",
        "coords": [
          -71.892452,
          -36.854207
        ]
      },
      {
        "id": "ARR-003",
        "type": "arranque",
        "name": "Luis Díaz López",
        "meter": "MED-SJ-1003",
        "rut": "8.370.368-3",
        "status": "Al Día",
        "coords": [
          -71.887899,
          -36.853906
        ]
      },
      {
        "id": "ARR-004",
        "type": "arranque",
        "name": "Jorge Pérez Araya",
        "meter": "MED-SJ-1004",
        "rut": "8.493.824-4",
        "status": "Al Día",
        "coords": [
          -71.888224,
          -36.853837
        ]
      },
      {
        "id": "ARR-005",
        "type": "arranque",
        "name": "Pedro Soto Espinoza",
        "meter": "MED-SJ-1005",
        "rut": "8.617.280-5",
        "status": "Al Día",
        "coords": [
          -71.887158,
          -36.853592
        ]
      },
      {
        "id": "ARR-006",
        "type": "arranque",
        "name": "Manuel Contreras Alarcón",
        "meter": "MED-SJ-1006",
        "rut": "8.740.736-6",
        "status": "Al Día",
        "coords": [
          -71.887811,
          -36.853225
        ]
      },
      {
        "id": "ARR-007",
        "type": "arranque",
        "name": "Víctor Silva Ramírez",
        "meter": "MED-SJ-1007",
        "rut": "8.864.192-7",
        "status": "Al Día",
        "coords": [
          -71.890428,
          -36.853059
        ]
      },
      {
        "id": "ARR-008",
        "type": "arranque",
        "name": "Héctor Morales Guzmán",
        "meter": "MED-SJ-1008",
        "rut": "8.987.648-8",
        "status": "Al Día",
        "coords": [
          -71.890393,
          -36.852823
        ]
      },
      {
        "id": "ARR-009",
        "type": "arranque",
        "name": "Raúl López San Martín",
        "meter": "MED-SJ-1009",
        "rut": "9.111.104-0",
        "status": "Al Día",
        "coords": [
          -71.89062,
          -36.852757
        ]
      },
      {
        "id": "ARR-010",
        "type": "arranque",
        "name": "Rosa Sepúlveda Rojas",
        "meter": "MED-SJ-1010",
        "rut": "9.234.560-1",
        "status": "Al Día",
        "coords": [
          -71.887282,
          -36.852737
        ]
      },
      {
        "id": "ARR-011",
        "type": "arranque",
        "name": "María Fuentes Soto",
        "meter": "MED-SJ-1011",
        "rut": "9.358.016-2",
        "status": "Al Día",
        "coords": [
          -71.890819,
          -36.852629
        ]
      },
      {
        "id": "ARR-012",
        "type": "arranque",
        "name": "Escuela Básica Rural Santa Juana",
        "meter": "MED-SJ-1012",
        "rut": "9.481.472-3",
        "status": "Al Día",
        "coords": [
          -71.890141,
          -36.852613
        ]
      },
      {
        "id": "ARR-013",
        "type": "arranque",
        "name": "Ana Castillo Fuentes",
        "meter": "MED-SJ-1013",
        "rut": "9.604.928-4",
        "status": "Al Día",
        "coords": [
          -71.887367,
          -36.852484
        ]
      },
      {
        "id": "ARR-014",
        "type": "arranque",
        "name": "Patricia Torres Torres",
        "meter": "MED-SJ-1014",
        "rut": "9.728.384-5",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.886962,
          -36.852422
        ]
      },
      {
        "id": "ARR-015",
        "type": "arranque",
        "name": "Margarita Espinoza Rivera",
        "meter": "MED-SJ-1015",
        "rut": "9.851.840-6",
        "status": "Al Día",
        "coords": [
          -71.884033,
          -36.852399
        ]
      },
      {
        "id": "ARR-016",
        "type": "arranque",
        "name": "Gloria Flores Carrasco",
        "meter": "MED-SJ-1016",
        "rut": "9.975.296-7",
        "status": "Al Día",
        "coords": [
          -71.887109,
          -36.852082
        ]
      },
      {
        "id": "ARR-017",
        "type": "arranque",
        "name": "Teresa Rivera Henríquez",
        "meter": "MED-SJ-1017",
        "rut": "10.098.752-8",
        "status": "Al Día",
        "coords": [
          -71.887444,
          -36.85206
        ]
      },
      {
        "id": "ARR-018",
        "type": "arranque",
        "name": "Posta de Salud Rural Santa Juana",
        "meter": "MED-SJ-1018",
        "rut": "10.222.208-0",
        "status": "Al Día",
        "coords": [
          -71.8843,
          -36.851924
        ]
      },
      {
        "id": "ARR-019",
        "type": "arranque",
        "name": "Elizabeth Valenzuela Muñoz",
        "meter": "MED-SJ-1019",
        "rut": "10.345.664-1",
        "status": "Al Día",
        "coords": [
          -71.906165,
          -36.851804
        ]
      },
      {
        "id": "ARR-020",
        "type": "arranque",
        "name": "Juan Carrasco Pérez",
        "meter": "MED-SJ-1020",
        "rut": "10.469.120-2",
        "status": "Al Día",
        "coords": [
          -71.906379,
          -36.851348
        ]
      },
      {
        "id": "ARR-021",
        "type": "arranque",
        "name": "José Ramírez Silva",
        "meter": "MED-SJ-1021",
        "rut": "10.592.576-3",
        "status": "Al Día",
        "coords": [
          -71.892245,
          -36.85125
        ]
      },
      {
        "id": "ARR-022",
        "type": "arranque",
        "name": "Carlos Reyes Sepúlveda",
        "meter": "MED-SJ-1022",
        "rut": "10.716.032-4",
        "status": "Al Día",
        "coords": [
          -71.906087,
          -36.850898
        ]
      },
      {
        "id": "ARR-023",
        "type": "arranque",
        "name": "Luis Henríquez Castillo",
        "meter": "MED-SJ-1023",
        "rut": "10.839.488-5",
        "status": "Al Día",
        "coords": [
          -71.906413,
          -36.85079
        ]
      },
      {
        "id": "ARR-024",
        "type": "arranque",
        "name": "Jorge Guzmán Flores",
        "meter": "MED-SJ-1024",
        "rut": "10.962.944-6",
        "status": "Al Día",
        "coords": [
          -71.892421,
          -36.850629
        ]
      },
      {
        "id": "ARR-025",
        "type": "arranque",
        "name": "Sede Social y Cancha SSR El Calvario",
        "meter": "MED-SJ-1025",
        "rut": "11.086.400-7",
        "status": "Al Día",
        "coords": [
          -71.938007,
          -36.850527
        ]
      },
      {
        "id": "ARR-026",
        "type": "arranque",
        "name": "Manuel Cifuentes Reyes",
        "meter": "MED-SJ-1026",
        "rut": "11.209.856-8",
        "status": "Al Día",
        "coords": [
          -71.884667,
          -36.850448
        ]
      },
      {
        "id": "ARR-027",
        "type": "arranque",
        "name": "Víctor San Martín Salazar",
        "meter": "MED-SJ-1027",
        "rut": "11.333.312-0",
        "status": "Al Día",
        "coords": [
          -71.937838,
          -36.85042
        ]
      },
      {
        "id": "ARR-028",
        "type": "arranque",
        "name": "Héctor González González",
        "meter": "MED-SJ-1028",
        "rut": "11.456.768-1",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.937395,
          -36.850342
        ]
      },
      {
        "id": "ARR-029",
        "type": "arranque",
        "name": "Raúl Muñoz Díaz",
        "meter": "MED-SJ-1029",
        "rut": "11.580.224-2",
        "status": "Suspendido por Fuga",
        "coords": [
          -71.884667,
          -36.850288
        ]
      },
      {
        "id": "ARR-030",
        "type": "arranque",
        "name": "Rosa Rojas Contreras",
        "meter": "MED-SJ-1030",
        "rut": "11.703.680-3",
        "status": "Al Día",
        "coords": [
          -71.938644,
          -36.850192
        ]
      },
      {
        "id": "ARR-031",
        "type": "arranque",
        "name": "María Díaz López",
        "meter": "MED-SJ-1031",
        "rut": "11.827.136-4",
        "status": "Al Día",
        "coords": [
          -71.935763,
          -36.850038
        ]
      },
      {
        "id": "ARR-032",
        "type": "arranque",
        "name": "Carmen Pérez Araya",
        "meter": "MED-SJ-1032",
        "rut": "11.950.592-5",
        "status": "Al Día",
        "coords": [
          -71.935592,
          -36.849981
        ]
      },
      {
        "id": "ARR-033",
        "type": "arranque",
        "name": "Ana Soto Espinoza",
        "meter": "MED-SJ-1033",
        "rut": "12.074.048-6",
        "status": "Al Día",
        "coords": [
          -71.891576,
          -36.849972
        ]
      },
      {
        "id": "ARR-034",
        "type": "arranque",
        "name": "Patricia Contreras Alarcón",
        "meter": "MED-SJ-1034",
        "rut": "12.197.504-7",
        "status": "Al Día",
        "coords": [
          -71.892856,
          -36.849933
        ]
      },
      {
        "id": "ARR-035",
        "type": "arranque",
        "name": "Margarita Silva Ramírez",
        "meter": "MED-SJ-1035",
        "rut": "12.320.960-8",
        "status": "Al Día",
        "coords": [
          -71.892358,
          -36.849897
        ]
      },
      {
        "id": "ARR-036",
        "type": "arranque",
        "name": "Gloria Morales Guzmán",
        "meter": "MED-SJ-1036",
        "rut": "12.444.416-0",
        "status": "Al Día",
        "coords": [
          -71.929171,
          -36.849747
        ]
      },
      {
        "id": "ARR-037",
        "type": "arranque",
        "name": "Teresa López San Martín",
        "meter": "MED-SJ-1037",
        "rut": "12.567.872-1",
        "status": "Al Día",
        "coords": [
          -71.881474,
          -36.849731
        ]
      },
      {
        "id": "ARR-038",
        "type": "arranque",
        "name": "Silvia Sepúlveda Rojas",
        "meter": "MED-SJ-1038",
        "rut": "12.691.328-2",
        "status": "Al Día",
        "coords": [
          -71.936729,
          -36.849598
        ]
      },
      {
        "id": "ARR-039",
        "type": "arranque",
        "name": "Elizabeth Fuentes Soto",
        "meter": "MED-SJ-1039",
        "rut": "12.814.784-3",
        "status": "Al Día",
        "coords": [
          -71.92905,
          -36.849553
        ]
      },
      {
        "id": "ARR-040",
        "type": "arranque",
        "name": "Juan Araya Morales",
        "meter": "MED-SJ-1040",
        "rut": "12.938.240-4",
        "status": "Al Día",
        "coords": [
          -71.936055,
          -36.849474
        ]
      },
      {
        "id": "ARR-041",
        "type": "arranque",
        "name": "José Castillo Fuentes",
        "meter": "MED-SJ-1041",
        "rut": "13.061.696-5",
        "status": "Al Día",
        "coords": [
          -71.887063,
          -36.849459
        ]
      },
      {
        "id": "ARR-042",
        "type": "arranque",
        "name": "Carlos Torres Torres",
        "meter": "MED-SJ-1042",
        "rut": "13.185.152-6",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.93533,
          -36.849443
        ]
      },
      {
        "id": "ARR-043",
        "type": "arranque",
        "name": "Luis Espinoza Rivera",
        "meter": "MED-SJ-1043",
        "rut": "13.308.608-7",
        "status": "Al Día",
        "coords": [
          -71.934986,
          -36.849414
        ]
      },
      {
        "id": "ARR-044",
        "type": "arranque",
        "name": "Jorge Flores Carrasco",
        "meter": "MED-SJ-1044",
        "rut": "13.432.064-8",
        "status": "Al Día",
        "coords": [
          -71.928725,
          -36.849412
        ]
      },
      {
        "id": "ARR-045",
        "type": "arranque",
        "name": "Pedro Rivera Henríquez",
        "meter": "MED-SJ-1045",
        "rut": "13.555.520-0",
        "status": "Al Día",
        "coords": [
          -71.887169,
          -36.84941
        ]
      },
      {
        "id": "ARR-046",
        "type": "arranque",
        "name": "Manuel Alarcón Cifuentes",
        "meter": "MED-SJ-1046",
        "rut": "13.678.976-1",
        "status": "Al Día",
        "coords": [
          -71.934637,
          -36.849367
        ]
      },
      {
        "id": "ARR-047",
        "type": "arranque",
        "name": "Víctor Valenzuela Muñoz",
        "meter": "MED-SJ-1047",
        "rut": "13.802.432-2",
        "status": "Al Día",
        "coords": [
          -71.936198,
          -36.849365
        ]
      },
      {
        "id": "ARR-048",
        "type": "arranque",
        "name": "Héctor Carrasco Pérez",
        "meter": "MED-SJ-1048",
        "rut": "13.925.888-3",
        "status": "Al Día",
        "coords": [
          -71.928301,
          -36.849358
        ]
      },
      {
        "id": "ARR-049",
        "type": "arranque",
        "name": "Raúl Ramírez Silva",
        "meter": "MED-SJ-1049",
        "rut": "14.049.344-4",
        "status": "Al Día",
        "coords": [
          -71.933061,
          -36.84933
        ]
      },
      {
        "id": "ARR-050",
        "type": "arranque",
        "name": "Rosa Reyes Sepúlveda",
        "meter": "MED-SJ-1050",
        "rut": "14.172.800-5",
        "status": "Al Día",
        "coords": [
          -71.883014,
          -36.849308
        ]
      },
      {
        "id": "ARR-051",
        "type": "arranque",
        "name": "María Henríquez Castillo",
        "meter": "MED-SJ-1051",
        "rut": "14.296.256-6",
        "status": "Al Día",
        "coords": [
          -71.933274,
          -36.849277
        ]
      },
      {
        "id": "ARR-052",
        "type": "arranque",
        "name": "Carmen Guzmán Flores",
        "meter": "MED-SJ-1052",
        "rut": "14.419.712-7",
        "status": "Al Día",
        "coords": [
          -71.932451,
          -36.849261
        ]
      },
      {
        "id": "ARR-053",
        "type": "arranque",
        "name": "Ana Salazar Valenzuela",
        "meter": "MED-SJ-1053",
        "rut": "14.543.168-8",
        "status": "Al Día",
        "coords": [
          -71.936045,
          -36.849242
        ]
      },
      {
        "id": "ARR-054",
        "type": "arranque",
        "name": "Patricia Cifuentes Reyes",
        "meter": "MED-SJ-1054",
        "rut": "14.666.624-0",
        "status": "Al Día",
        "coords": [
          -71.935788,
          -36.849228
        ]
      },
      {
        "id": "ARR-055",
        "type": "arranque",
        "name": "Margarita San Martín Salazar",
        "meter": "MED-SJ-1055",
        "rut": "14.790.080-1",
        "status": "Al Día",
        "coords": [
          -71.931928,
          -36.849197
        ]
      },
      {
        "id": "ARR-056",
        "type": "arranque",
        "name": "Gloria González González",
        "meter": "MED-SJ-1056",
        "rut": "14.913.536-2",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.881662,
          -36.849183
        ]
      },
      {
        "id": "ARR-057",
        "type": "arranque",
        "name": "Teresa Muñoz Díaz",
        "meter": "MED-SJ-1057",
        "rut": "15.036.992-3",
        "status": "Al Día",
        "coords": [
          -71.932991,
          -36.849167
        ]
      },
      {
        "id": "ARR-058",
        "type": "arranque",
        "name": "Silvia Rojas Contreras",
        "meter": "MED-SJ-1058",
        "rut": "15.160.448-4",
        "status": "Suspendido por Fuga",
        "coords": [
          -71.87903,
          -36.849131
        ]
      },
      {
        "id": "ARR-059",
        "type": "arranque",
        "name": "Elizabeth Díaz López",
        "meter": "MED-SJ-1059",
        "rut": "15.283.904-5",
        "status": "Al Día",
        "coords": [
          -71.932681,
          -36.849121
        ]
      },
      {
        "id": "ARR-060",
        "type": "arranque",
        "name": "Juan Pérez Araya",
        "meter": "MED-SJ-1060",
        "rut": "15.407.360-6",
        "status": "Al Día",
        "coords": [
          -71.884117,
          -36.849102
        ]
      },
      {
        "id": "ARR-061",
        "type": "arranque",
        "name": "José Soto Espinoza",
        "meter": "MED-SJ-1061",
        "rut": "15.530.816-7",
        "status": "Al Día",
        "coords": [
          -71.933028,
          -36.849078
        ]
      },
      {
        "id": "ARR-062",
        "type": "arranque",
        "name": "Carlos Contreras Alarcón",
        "meter": "MED-SJ-1062",
        "rut": "15.654.272-8",
        "status": "Al Día",
        "coords": [
          -71.876709,
          -36.849072
        ]
      },
      {
        "id": "ARR-063",
        "type": "arranque",
        "name": "Luis Silva Ramírez",
        "meter": "MED-SJ-1063",
        "rut": "15.777.728-0",
        "status": "Al Día",
        "coords": [
          -71.873887,
          -36.849065
        ]
      },
      {
        "id": "ARR-064",
        "type": "arranque",
        "name": "Jorge Morales Guzmán",
        "meter": "MED-SJ-1064",
        "rut": "15.901.184-1",
        "status": "Al Día",
        "coords": [
          -71.895403,
          -36.849046
        ]
      },
      {
        "id": "ARR-065",
        "type": "arranque",
        "name": "Pedro López San Martín",
        "meter": "MED-SJ-1065",
        "rut": "16.024.640-2",
        "status": "Al Día",
        "coords": [
          -71.896023,
          -36.849001
        ]
      },
      {
        "id": "ARR-066",
        "type": "arranque",
        "name": "Manuel Sepúlveda Rojas",
        "meter": "MED-SJ-1066",
        "rut": "16.148.096-3",
        "status": "Al Día",
        "coords": [
          -71.884265,
          -36.848998
        ]
      },
      {
        "id": "ARR-067",
        "type": "arranque",
        "name": "Víctor Fuentes Soto",
        "meter": "MED-SJ-1067",
        "rut": "16.271.552-4",
        "status": "Al Día",
        "coords": [
          -71.88054,
          -36.848989
        ]
      },
      {
        "id": "ARR-068",
        "type": "arranque",
        "name": "Héctor Araya Morales",
        "meter": "MED-SJ-1068",
        "rut": "16.395.008-5",
        "status": "Al Día",
        "coords": [
          -71.874192,
          -36.848987
        ]
      },
      {
        "id": "ARR-069",
        "type": "arranque",
        "name": "Raúl Castillo Fuentes",
        "meter": "MED-SJ-1069",
        "rut": "16.518.464-6",
        "status": "Al Día",
        "coords": [
          -71.882541,
          -36.848984
        ]
      },
      {
        "id": "ARR-070",
        "type": "arranque",
        "name": "Rosa Torres Torres",
        "meter": "MED-SJ-1070",
        "rut": "16.641.920-7",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.884498,
          -36.848982
        ]
      },
      {
        "id": "ARR-071",
        "type": "arranque",
        "name": "María Espinoza Rivera",
        "meter": "MED-SJ-1071",
        "rut": "16.765.376-8",
        "status": "Al Día",
        "coords": [
          -71.923653,
          -36.848974
        ]
      },
      {
        "id": "ARR-072",
        "type": "arranque",
        "name": "Carmen Flores Carrasco",
        "meter": "MED-SJ-1072",
        "rut": "16.888.832-0",
        "status": "Al Día",
        "coords": [
          -71.90253,
          -36.848951
        ]
      },
      {
        "id": "ARR-073",
        "type": "arranque",
        "name": "Ana Rivera Henríquez",
        "meter": "MED-SJ-1073",
        "rut": "17.012.288-1",
        "status": "Al Día",
        "coords": [
          -71.878825,
          -36.848947
        ]
      },
      {
        "id": "ARR-074",
        "type": "arranque",
        "name": "Patricia Alarcón Cifuentes",
        "meter": "MED-SJ-1074",
        "rut": "17.135.744-2",
        "status": "Al Día",
        "coords": [
          -71.881566,
          -36.848942
        ]
      },
      {
        "id": "ARR-075",
        "type": "arranque",
        "name": "Margarita Valenzuela Muñoz",
        "meter": "MED-SJ-1075",
        "rut": "17.259.200-3",
        "status": "Al Día",
        "coords": [
          -71.923121,
          -36.848931
        ]
      },
      {
        "id": "ARR-076",
        "type": "arranque",
        "name": "Gloria Carrasco Pérez",
        "meter": "MED-SJ-1076",
        "rut": "17.382.656-4",
        "status": "Al Día",
        "coords": [
          -71.87927,
          -36.848928
        ]
      },
      {
        "id": "ARR-077",
        "type": "arranque",
        "name": "Teresa Ramírez Silva",
        "meter": "MED-SJ-1077",
        "rut": "17.506.112-5",
        "status": "Al Día",
        "coords": [
          -71.88005,
          -36.848883
        ]
      },
      {
        "id": "ARR-078",
        "type": "arranque",
        "name": "Silvia Reyes Sepúlveda",
        "meter": "MED-SJ-1078",
        "rut": "17.629.568-6",
        "status": "Al Día",
        "coords": [
          -71.927559,
          -36.848852
        ]
      },
      {
        "id": "ARR-079",
        "type": "arranque",
        "name": "Elizabeth Henríquez Castillo",
        "meter": "MED-SJ-1079",
        "rut": "17.753.024-7",
        "status": "Al Día",
        "coords": [
          -71.885113,
          -36.848842
        ]
      },
      {
        "id": "ARR-080",
        "type": "arranque",
        "name": "Juan Guzmán Flores",
        "meter": "MED-SJ-1080",
        "rut": "17.876.480-8",
        "status": "Al Día",
        "coords": [
          -71.87854,
          -36.84882
        ]
      },
      {
        "id": "ARR-081",
        "type": "arranque",
        "name": "José Salazar Valenzuela",
        "meter": "MED-SJ-1081",
        "rut": "17.999.936-0",
        "status": "Al Día",
        "coords": [
          -71.932582,
          -36.848816
        ]
      },
      {
        "id": "ARR-082",
        "type": "arranque",
        "name": "Carlos Cifuentes Reyes",
        "meter": "MED-SJ-1082",
        "rut": "18.123.392-1",
        "status": "Al Día",
        "coords": [
          -71.93338,
          -36.848811
        ]
      },
      {
        "id": "ARR-083",
        "type": "arranque",
        "name": "Luis San Martín Salazar",
        "meter": "MED-SJ-1083",
        "rut": "18.246.848-2",
        "status": "Al Día",
        "coords": [
          -71.881561,
          -36.84877
        ]
      },
      {
        "id": "ARR-084",
        "type": "arranque",
        "name": "Jorge González González",
        "meter": "MED-SJ-1084",
        "rut": "18.370.304-3",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.918027,
          -36.848697
        ]
      },
      {
        "id": "ARR-085",
        "type": "arranque",
        "name": "Pedro Muñoz Díaz",
        "meter": "MED-SJ-1085",
        "rut": "18.493.760-4",
        "status": "Al Día",
        "coords": [
          -71.936046,
          -36.848586
        ]
      },
      {
        "id": "ARR-086",
        "type": "arranque",
        "name": "Manuel Rojas Contreras",
        "meter": "MED-SJ-1086",
        "rut": "18.617.216-5",
        "status": "Al Día",
        "coords": [
          -71.900382,
          -36.848567
        ]
      },
      {
        "id": "ARR-087",
        "type": "arranque",
        "name": "Víctor Díaz López",
        "meter": "MED-SJ-1087",
        "rut": "18.740.672-6",
        "status": "Suspendido por Fuga",
        "coords": [
          -71.880111,
          -36.848542
        ]
      },
      {
        "id": "ARR-088",
        "type": "arranque",
        "name": "Héctor Pérez Araya",
        "meter": "MED-SJ-1088",
        "rut": "18.864.128-7",
        "status": "Al Día",
        "coords": [
          -71.879411,
          -36.848522
        ]
      },
      {
        "id": "ARR-089",
        "type": "arranque",
        "name": "Raúl Soto Espinoza",
        "meter": "MED-SJ-1089",
        "rut": "18.987.584-8",
        "status": "Al Día",
        "coords": [
          -71.891486,
          -36.848456
        ]
      },
      {
        "id": "ARR-090",
        "type": "arranque",
        "name": "Rosa Contreras Alarcón",
        "meter": "MED-SJ-1090",
        "rut": "19.111.040-0",
        "status": "Al Día",
        "coords": [
          -71.874098,
          -36.848448
        ]
      },
      {
        "id": "ARR-091",
        "type": "arranque",
        "name": "María Silva Ramírez",
        "meter": "MED-SJ-1091",
        "rut": "19.234.496-1",
        "status": "Al Día",
        "coords": [
          -71.895909,
          -36.848444
        ]
      },
      {
        "id": "ARR-092",
        "type": "arranque",
        "name": "Carmen Morales Guzmán",
        "meter": "MED-SJ-1092",
        "rut": "19.357.952-2",
        "status": "Al Día",
        "coords": [
          -71.924986,
          -36.848438
        ]
      },
      {
        "id": "ARR-093",
        "type": "arranque",
        "name": "Ana López San Martín",
        "meter": "MED-SJ-1093",
        "rut": "19.481.408-3",
        "status": "Al Día",
        "coords": [
          -71.877289,
          -36.848393
        ]
      },
      {
        "id": "ARR-094",
        "type": "arranque",
        "name": "Patricia Sepúlveda Rojas",
        "meter": "MED-SJ-1094",
        "rut": "19.604.864-4",
        "status": "Al Día",
        "coords": [
          -71.882807,
          -36.848384
        ]
      },
      {
        "id": "ARR-095",
        "type": "arranque",
        "name": "Margarita Fuentes Soto",
        "meter": "MED-SJ-1095",
        "rut": "19.728.320-5",
        "status": "Al Día",
        "coords": [
          -71.877037,
          -36.8483
        ]
      },
      {
        "id": "ARR-096",
        "type": "arranque",
        "name": "Gloria Araya Morales",
        "meter": "MED-SJ-1096",
        "rut": "19.851.776-6",
        "status": "Al Día",
        "coords": [
          -71.890357,
          -36.848214
        ]
      },
      {
        "id": "ARR-097",
        "type": "arranque",
        "name": "Teresa Castillo Fuentes",
        "meter": "MED-SJ-1097",
        "rut": "19.975.232-7",
        "status": "Al Día",
        "coords": [
          -71.922416,
          -36.84812
        ]
      },
      {
        "id": "ARR-098",
        "type": "arranque",
        "name": "Silvia Torres Torres",
        "meter": "MED-SJ-1098",
        "rut": "8.098.688-8",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.882785,
          -36.848114
        ]
      },
      {
        "id": "ARR-099",
        "type": "arranque",
        "name": "Elizabeth Espinoza Rivera",
        "meter": "MED-SJ-1099",
        "rut": "8.222.144-0",
        "status": "Al Día",
        "coords": [
          -71.920556,
          -36.848074
        ]
      },
      {
        "id": "ARR-100",
        "type": "arranque",
        "name": "Juan Flores Carrasco",
        "meter": "MED-SJ-1100",
        "rut": "8.345.600-1",
        "status": "Al Día",
        "coords": [
          -71.876298,
          -36.848021
        ]
      },
      {
        "id": "ARR-101",
        "type": "arranque",
        "name": "José Rivera Henríquez",
        "meter": "MED-SJ-1101",
        "rut": "8.469.056-2",
        "status": "Al Día",
        "coords": [
          -71.892051,
          -36.848016
        ]
      },
      {
        "id": "ARR-102",
        "type": "arranque",
        "name": "Carlos Alarcón Cifuentes",
        "meter": "MED-SJ-1102",
        "rut": "8.592.512-3",
        "status": "Al Día",
        "coords": [
          -71.891224,
          -36.847982
        ]
      },
      {
        "id": "ARR-103",
        "type": "arranque",
        "name": "Luis Valenzuela Muñoz",
        "meter": "MED-SJ-1103",
        "rut": "8.715.968-4",
        "status": "Al Día",
        "coords": [
          -71.921032,
          -36.847932
        ]
      },
      {
        "id": "ARR-104",
        "type": "arranque",
        "name": "Jorge Carrasco Pérez",
        "meter": "MED-SJ-1104",
        "rut": "8.839.424-5",
        "status": "Al Día",
        "coords": [
          -71.916445,
          -36.847868
        ]
      },
      {
        "id": "ARR-105",
        "type": "arranque",
        "name": "Pedro Ramírez Silva",
        "meter": "MED-SJ-1105",
        "rut": "8.962.880-6",
        "status": "Al Día",
        "coords": [
          -71.881894,
          -36.847829
        ]
      },
      {
        "id": "ARR-106",
        "type": "arranque",
        "name": "Manuel Reyes Sepúlveda",
        "meter": "MED-SJ-1106",
        "rut": "9.086.336-7",
        "status": "Al Día",
        "coords": [
          -71.916736,
          -36.847806
        ]
      },
      {
        "id": "ARR-107",
        "type": "arranque",
        "name": "Víctor Henríquez Castillo",
        "meter": "MED-SJ-1107",
        "rut": "9.209.792-8",
        "status": "Al Día",
        "coords": [
          -71.876174,
          -36.847757
        ]
      },
      {
        "id": "ARR-108",
        "type": "arranque",
        "name": "Héctor Guzmán Flores",
        "meter": "MED-SJ-1108",
        "rut": "9.333.248-0",
        "status": "Al Día",
        "coords": [
          -71.891232,
          -36.847732
        ]
      },
      {
        "id": "ARR-109",
        "type": "arranque",
        "name": "Raúl Salazar Valenzuela",
        "meter": "MED-SJ-1109",
        "rut": "9.456.704-1",
        "status": "Al Día",
        "coords": [
          -71.916245,
          -36.847729
        ]
      },
      {
        "id": "ARR-110",
        "type": "arranque",
        "name": "Rosa Cifuentes Reyes",
        "meter": "MED-SJ-1110",
        "rut": "9.580.160-2",
        "status": "Al Día",
        "coords": [
          -71.909225,
          -36.847711
        ]
      },
      {
        "id": "ARR-111",
        "type": "arranque",
        "name": "María San Martín Salazar",
        "meter": "MED-SJ-1111",
        "rut": "9.703.616-3",
        "status": "Al Día",
        "coords": [
          -71.891604,
          -36.84769
        ]
      },
      {
        "id": "ARR-112",
        "type": "arranque",
        "name": "Carmen González González",
        "meter": "MED-SJ-1112",
        "rut": "9.827.072-4",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.875473,
          -36.847688
        ]
      },
      {
        "id": "ARR-113",
        "type": "arranque",
        "name": "Ana Muñoz Díaz",
        "meter": "MED-SJ-1113",
        "rut": "9.950.528-5",
        "status": "Al Día",
        "coords": [
          -71.878638,
          -36.847624
        ]
      },
      {
        "id": "ARR-114",
        "type": "arranque",
        "name": "Patricia Rojas Contreras",
        "meter": "MED-SJ-1114",
        "rut": "10.073.984-6",
        "status": "Al Día",
        "coords": [
          -71.916956,
          -36.847524
        ]
      },
      {
        "id": "ARR-115",
        "type": "arranque",
        "name": "Margarita Díaz López",
        "meter": "MED-SJ-1115",
        "rut": "10.197.440-7",
        "status": "Al Día",
        "coords": [
          -71.875112,
          -36.84751
        ]
      },
      {
        "id": "ARR-116",
        "type": "arranque",
        "name": "Gloria Pérez Araya",
        "meter": "MED-SJ-1116",
        "rut": "10.320.896-8",
        "status": "Suspendido por Fuga",
        "coords": [
          -71.875379,
          -36.847501
        ]
      },
      {
        "id": "ARR-117",
        "type": "arranque",
        "name": "Teresa Soto Espinoza",
        "meter": "MED-SJ-1117",
        "rut": "10.444.352-0",
        "status": "Al Día",
        "coords": [
          -71.916499,
          -36.847497
        ]
      },
      {
        "id": "ARR-118",
        "type": "arranque",
        "name": "Silvia Contreras Alarcón",
        "meter": "MED-SJ-1118",
        "rut": "10.567.808-1",
        "status": "Al Día",
        "coords": [
          -71.891037,
          -36.847492
        ]
      },
      {
        "id": "ARR-119",
        "type": "arranque",
        "name": "Elizabeth Silva Ramírez",
        "meter": "MED-SJ-1119",
        "rut": "10.691.264-2",
        "status": "Al Día",
        "coords": [
          -71.895454,
          -36.84749
        ]
      },
      {
        "id": "ARR-120",
        "type": "arranque",
        "name": "Juan Morales Guzmán",
        "meter": "MED-SJ-1120",
        "rut": "10.814.720-3",
        "status": "Al Día",
        "coords": [
          -71.88061,
          -36.847486
        ]
      },
      {
        "id": "ARR-121",
        "type": "arranque",
        "name": "José López San Martín",
        "meter": "MED-SJ-1121",
        "rut": "10.938.176-4",
        "status": "Al Día",
        "coords": [
          -71.892483,
          -36.847451
        ]
      },
      {
        "id": "ARR-122",
        "type": "arranque",
        "name": "Carlos Sepúlveda Rojas",
        "meter": "MED-SJ-1122",
        "rut": "11.061.632-5",
        "status": "Al Día",
        "coords": [
          -71.88975,
          -36.847406
        ]
      },
      {
        "id": "ARR-123",
        "type": "arranque",
        "name": "Luis Fuentes Soto",
        "meter": "MED-SJ-1123",
        "rut": "11.185.088-6",
        "status": "Al Día",
        "coords": [
          -71.898642,
          -36.847381
        ]
      },
      {
        "id": "ARR-124",
        "type": "arranque",
        "name": "Jorge Araya Morales",
        "meter": "MED-SJ-1124",
        "rut": "11.308.544-7",
        "status": "Al Día",
        "coords": [
          -71.880181,
          -36.847304
        ]
      },
      {
        "id": "ARR-125",
        "type": "arranque",
        "name": "Pedro Castillo Fuentes",
        "meter": "MED-SJ-1125",
        "rut": "11.432.000-8",
        "status": "Al Día",
        "coords": [
          -71.898099,
          -36.847253
        ]
      },
      {
        "id": "ARR-126",
        "type": "arranque",
        "name": "Manuel Torres Torres",
        "meter": "MED-SJ-1126",
        "rut": "11.555.456-0",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.915257,
          -36.84724
        ]
      },
      {
        "id": "ARR-127",
        "type": "arranque",
        "name": "Víctor Espinoza Rivera",
        "meter": "MED-SJ-1127",
        "rut": "11.678.912-1",
        "status": "Al Día",
        "coords": [
          -71.913813,
          -36.84724
        ]
      },
      {
        "id": "ARR-128",
        "type": "arranque",
        "name": "Héctor Flores Carrasco",
        "meter": "MED-SJ-1128",
        "rut": "11.802.368-2",
        "status": "Al Día",
        "coords": [
          -71.904331,
          -36.84723
        ]
      },
      {
        "id": "ARR-129",
        "type": "arranque",
        "name": "Raúl Rivera Henríquez",
        "meter": "MED-SJ-1129",
        "rut": "11.925.824-3",
        "status": "Al Día",
        "coords": [
          -71.915538,
          -36.847226
        ]
      },
      {
        "id": "ARR-130",
        "type": "arranque",
        "name": "Rosa Alarcón Cifuentes",
        "meter": "MED-SJ-1130",
        "rut": "12.049.280-4",
        "status": "Al Día",
        "coords": [
          -71.914015,
          -36.847211
        ]
      },
      {
        "id": "ARR-131",
        "type": "arranque",
        "name": "María Valenzuela Muñoz",
        "meter": "MED-SJ-1131",
        "rut": "12.172.736-5",
        "status": "Al Día",
        "coords": [
          -71.91437,
          -36.847202
        ]
      },
      {
        "id": "ARR-132",
        "type": "arranque",
        "name": "Carmen Carrasco Pérez",
        "meter": "MED-SJ-1132",
        "rut": "12.296.192-6",
        "status": "Al Día",
        "coords": [
          -71.913648,
          -36.847185
        ]
      },
      {
        "id": "ARR-133",
        "type": "arranque",
        "name": "Ana Ramírez Silva",
        "meter": "MED-SJ-1133",
        "rut": "12.419.648-7",
        "status": "Al Día",
        "coords": [
          -71.896944,
          -36.847183
        ]
      },
      {
        "id": "ARR-134",
        "type": "arranque",
        "name": "Patricia Reyes Sepúlveda",
        "meter": "MED-SJ-1134",
        "rut": "12.543.104-8",
        "status": "Al Día",
        "coords": [
          -71.880254,
          -36.847168
        ]
      },
      {
        "id": "ARR-135",
        "type": "arranque",
        "name": "Margarita Henríquez Castillo",
        "meter": "MED-SJ-1135",
        "rut": "12.666.560-0",
        "status": "Al Día",
        "coords": [
          -71.897872,
          -36.847144
        ]
      },
      {
        "id": "ARR-136",
        "type": "arranque",
        "name": "Gloria Guzmán Flores",
        "meter": "MED-SJ-1136",
        "rut": "12.790.016-1",
        "status": "Al Día",
        "coords": [
          -71.899895,
          -36.847135
        ]
      },
      {
        "id": "ARR-137",
        "type": "arranque",
        "name": "Teresa Salazar Valenzuela",
        "meter": "MED-SJ-1137",
        "rut": "12.913.472-2",
        "status": "Al Día",
        "coords": [
          -71.895933,
          -36.847101
        ]
      },
      {
        "id": "ARR-138",
        "type": "arranque",
        "name": "Silvia Cifuentes Reyes",
        "meter": "MED-SJ-1138",
        "rut": "13.036.928-3",
        "status": "Al Día",
        "coords": [
          -71.883494,
          -36.847072
        ]
      },
      {
        "id": "ARR-139",
        "type": "arranque",
        "name": "Elizabeth San Martín Salazar",
        "meter": "MED-SJ-1139",
        "rut": "13.160.384-4",
        "status": "Al Día",
        "coords": [
          -71.916966,
          -36.847037
        ]
      },
      {
        "id": "ARR-140",
        "type": "arranque",
        "name": "Juan González González",
        "meter": "MED-SJ-1140",
        "rut": "13.283.840-5",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.890969,
          -36.847005
        ]
      }
    ]
  },
  "VALV-03": {
    "valveId": "VALV-03",
    "sector": "Sector Santa Juana Norte (Camino Vecinal)",
    "desc_operativa": "Aislamiento de ramal secundario norte. Permite reparar roturas en camino vecinal sin afectar la troncal este ni El Calvario.",
    "tipo_corte": "Sectorización Ramal Norte",
    "recovery_time": "20 a 30 min (Llenado progresivo)",
    "pipes": [
      "CALV-03",
      "CALV-04"
    ],
    "pipesKm": 0.91,
    "pipesCount": 2,
    "affectedCount": 38,
    "consumers": [
      {
        "id": "ARR-136",
        "type": "arranque",
        "name": "Gloria Guzmán Flores",
        "meter": "MED-SJ-1136",
        "rut": "12.790.016-1",
        "status": "Al Día",
        "coords": [
          -71.899895,
          -36.847135
        ]
      },
      {
        "id": "ARR-086",
        "type": "arranque",
        "name": "Manuel Rojas Contreras",
        "meter": "MED-SJ-1086",
        "rut": "18.617.216-5",
        "status": "Al Día",
        "coords": [
          -71.900382,
          -36.848567
        ]
      },
      {
        "id": "ARR-072",
        "type": "arranque",
        "name": "Carmen Flores Carrasco",
        "meter": "MED-SJ-1072",
        "rut": "16.888.832-0",
        "status": "Al Día",
        "coords": [
          -71.90253,
          -36.848951
        ]
      },
      {
        "id": "ARR-128",
        "type": "arranque",
        "name": "Héctor Flores Carrasco",
        "meter": "MED-SJ-1128",
        "rut": "11.802.368-2",
        "status": "Al Día",
        "coords": [
          -71.904331,
          -36.84723
        ]
      },
      {
        "id": "ARR-123",
        "type": "arranque",
        "name": "Luis Fuentes Soto",
        "meter": "MED-SJ-1123",
        "rut": "11.185.088-6",
        "status": "Al Día",
        "coords": [
          -71.898642,
          -36.847381
        ]
      },
      {
        "id": "ARR-125",
        "type": "arranque",
        "name": "Pedro Castillo Fuentes",
        "meter": "MED-SJ-1125",
        "rut": "11.432.000-8",
        "status": "Al Día",
        "coords": [
          -71.898099,
          -36.847253
        ]
      },
      {
        "id": "ARR-135",
        "type": "arranque",
        "name": "Margarita Henríquez Castillo",
        "meter": "MED-SJ-1135",
        "rut": "12.666.560-0",
        "status": "Al Día",
        "coords": [
          -71.897872,
          -36.847144
        ]
      },
      {
        "id": "ARR-133",
        "type": "arranque",
        "name": "Ana Ramírez Silva",
        "meter": "MED-SJ-1133",
        "rut": "12.419.648-7",
        "status": "Al Día",
        "coords": [
          -71.896944,
          -36.847183
        ]
      },
      {
        "id": "ARR-137",
        "type": "arranque",
        "name": "Teresa Salazar Valenzuela",
        "meter": "MED-SJ-1137",
        "rut": "12.913.472-2",
        "status": "Al Día",
        "coords": [
          -71.895933,
          -36.847101
        ]
      },
      {
        "id": "ARR-091",
        "type": "arranque",
        "name": "María Silva Ramírez",
        "meter": "MED-SJ-1091",
        "rut": "19.234.496-1",
        "status": "Al Día",
        "coords": [
          -71.895909,
          -36.848444
        ]
      },
      {
        "id": "ARR-065",
        "type": "arranque",
        "name": "Pedro López San Martín",
        "meter": "MED-SJ-1065",
        "rut": "16.024.640-2",
        "status": "Al Día",
        "coords": [
          -71.896023,
          -36.849001
        ]
      },
      {
        "id": "ARR-022",
        "type": "arranque",
        "name": "Carlos Reyes Sepúlveda",
        "meter": "MED-SJ-1022",
        "rut": "10.716.032-4",
        "status": "Al Día",
        "coords": [
          -71.906087,
          -36.850898
        ]
      },
      {
        "id": "ARR-119",
        "type": "arranque",
        "name": "Elizabeth Silva Ramírez",
        "meter": "MED-SJ-1119",
        "rut": "10.691.264-2",
        "status": "Al Día",
        "coords": [
          -71.895454,
          -36.84749
        ]
      },
      {
        "id": "ARR-023",
        "type": "arranque",
        "name": "Luis Henríquez Castillo",
        "meter": "MED-SJ-1023",
        "rut": "10.839.488-5",
        "status": "Al Día",
        "coords": [
          -71.906413,
          -36.85079
        ]
      },
      {
        "id": "ARR-020",
        "type": "arranque",
        "name": "Juan Carrasco Pérez",
        "meter": "MED-SJ-1020",
        "rut": "10.469.120-2",
        "status": "Al Día",
        "coords": [
          -71.906379,
          -36.851348
        ]
      },
      {
        "id": "ARR-064",
        "type": "arranque",
        "name": "Jorge Morales Guzmán",
        "meter": "MED-SJ-1064",
        "rut": "15.901.184-1",
        "status": "Al Día",
        "coords": [
          -71.895403,
          -36.849046
        ]
      },
      {
        "id": "ARR-019",
        "type": "arranque",
        "name": "Elizabeth Valenzuela Muñoz",
        "meter": "MED-SJ-1019",
        "rut": "10.345.664-1",
        "status": "Al Día",
        "coords": [
          -71.906165,
          -36.851804
        ]
      },
      {
        "id": "ARR-110",
        "type": "arranque",
        "name": "Rosa Cifuentes Reyes",
        "meter": "MED-SJ-1110",
        "rut": "9.580.160-2",
        "status": "Al Día",
        "coords": [
          -71.909225,
          -36.847711
        ]
      },
      {
        "id": "ARR-121",
        "type": "arranque",
        "name": "José López San Martín",
        "meter": "MED-SJ-1121",
        "rut": "10.938.176-4",
        "status": "Al Día",
        "coords": [
          -71.892483,
          -36.847451
        ]
      },
      {
        "id": "ARR-034",
        "type": "arranque",
        "name": "Patricia Contreras Alarcón",
        "meter": "MED-SJ-1034",
        "rut": "12.197.504-7",
        "status": "Al Día",
        "coords": [
          -71.892856,
          -36.849933
        ]
      },
      {
        "id": "ARR-101",
        "type": "arranque",
        "name": "José Rivera Henríquez",
        "meter": "MED-SJ-1101",
        "rut": "8.469.056-2",
        "status": "Al Día",
        "coords": [
          -71.892051,
          -36.848016
        ]
      },
      {
        "id": "ARR-035",
        "type": "arranque",
        "name": "Margarita Silva Ramírez",
        "meter": "MED-SJ-1035",
        "rut": "12.320.960-8",
        "status": "Al Día",
        "coords": [
          -71.892358,
          -36.849897
        ]
      },
      {
        "id": "ARR-111",
        "type": "arranque",
        "name": "María San Martín Salazar",
        "meter": "MED-SJ-1111",
        "rut": "9.703.616-3",
        "status": "Al Día",
        "coords": [
          -71.891604,
          -36.84769
        ]
      },
      {
        "id": "ARR-024",
        "type": "arranque",
        "name": "Jorge Guzmán Flores",
        "meter": "MED-SJ-1024",
        "rut": "10.962.944-6",
        "status": "Al Día",
        "coords": [
          -71.892421,
          -36.850629
        ]
      },
      {
        "id": "ARR-089",
        "type": "arranque",
        "name": "Raúl Soto Espinoza",
        "meter": "MED-SJ-1089",
        "rut": "18.987.584-8",
        "status": "Al Día",
        "coords": [
          -71.891486,
          -36.848456
        ]
      },
      {
        "id": "ARR-108",
        "type": "arranque",
        "name": "Héctor Guzmán Flores",
        "meter": "MED-SJ-1108",
        "rut": "9.333.248-0",
        "status": "Al Día",
        "coords": [
          -71.891232,
          -36.847732
        ]
      },
      {
        "id": "ARR-102",
        "type": "arranque",
        "name": "Carlos Alarcón Cifuentes",
        "meter": "MED-SJ-1102",
        "rut": "8.592.512-3",
        "status": "Al Día",
        "coords": [
          -71.891224,
          -36.847982
        ]
      },
      {
        "id": "ARR-021",
        "type": "arranque",
        "name": "José Ramírez Silva",
        "meter": "MED-SJ-1021",
        "rut": "10.592.576-3",
        "status": "Al Día",
        "coords": [
          -71.892245,
          -36.85125
        ]
      },
      {
        "id": "ARR-118",
        "type": "arranque",
        "name": "Silvia Contreras Alarcón",
        "meter": "MED-SJ-1118",
        "rut": "10.567.808-1",
        "status": "Al Día",
        "coords": [
          -71.891037,
          -36.847492
        ]
      },
      {
        "id": "ARR-033",
        "type": "arranque",
        "name": "Ana Soto Espinoza",
        "meter": "MED-SJ-1033",
        "rut": "12.074.048-6",
        "status": "Al Día",
        "coords": [
          -71.891576,
          -36.849972
        ]
      },
      {
        "id": "ARR-140",
        "type": "arranque",
        "name": "Juan González González",
        "meter": "MED-SJ-1140",
        "rut": "13.283.840-5",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.890969,
          -36.847005
        ]
      },
      {
        "id": "ARR-096",
        "type": "arranque",
        "name": "Gloria Araya Morales",
        "meter": "MED-SJ-1096",
        "rut": "19.851.776-6",
        "status": "Al Día",
        "coords": [
          -71.890357,
          -36.848214
        ]
      },
      {
        "id": "ARR-132",
        "type": "arranque",
        "name": "Carmen Carrasco Pérez",
        "meter": "MED-SJ-1132",
        "rut": "12.296.192-6",
        "status": "Al Día",
        "coords": [
          -71.913648,
          -36.847185
        ]
      },
      {
        "id": "ARR-122",
        "type": "arranque",
        "name": "Carlos Sepúlveda Rojas",
        "meter": "MED-SJ-1122",
        "rut": "11.061.632-5",
        "status": "Al Día",
        "coords": [
          -71.88975,
          -36.847406
        ]
      },
      {
        "id": "ARR-002",
        "type": "arranque",
        "name": "Carlos Rojas Contreras",
        "meter": "MED-SJ-1002",
        "rut": "8.246.912-2",
        "status": "Al Día",
        "coords": [
          -71.892452,
          -36.854207
        ]
      },
      {
        "id": "ARR-127",
        "type": "arranque",
        "name": "Víctor Espinoza Rivera",
        "meter": "MED-SJ-1127",
        "rut": "11.678.912-1",
        "status": "Al Día",
        "coords": [
          -71.913813,
          -36.84724
        ]
      },
      {
        "id": "ARR-130",
        "type": "arranque",
        "name": "Rosa Alarcón Cifuentes",
        "meter": "MED-SJ-1130",
        "rut": "12.049.280-4",
        "status": "Al Día",
        "coords": [
          -71.914015,
          -36.847211
        ]
      },
      {
        "id": "ARR-011",
        "type": "arranque",
        "name": "María Fuentes Soto",
        "meter": "MED-SJ-1011",
        "rut": "9.358.016-2",
        "status": "Al Día",
        "coords": [
          -71.890819,
          -36.852629
        ]
      }
    ]
  },
  "VALV-04": {
    "valveId": "VALV-04",
    "sector": "Sector Troncal Este (Camino a San Ignacio)",
    "desc_operativa": "Aislamiento del tramo este entre bifurcación central y faja camino San Ignacio.",
    "tipo_corte": "Sectorización Troncal Este",
    "recovery_time": "1.5 a 2.5 horas (Presurización general de red)",
    "pipes": [
      "CALV-06",
      "CALV-07"
    ],
    "pipesKm": 3.08,
    "pipesCount": 2,
    "affectedCount": 28,
    "consumers": [
      {
        "id": "ARR-133",
        "type": "arranque",
        "name": "Ana Ramírez Silva",
        "meter": "MED-SJ-1133",
        "rut": "12.419.648-7",
        "status": "Al Día",
        "coords": [
          -71.896944,
          -36.847183
        ]
      },
      {
        "id": "ARR-137",
        "type": "arranque",
        "name": "Teresa Salazar Valenzuela",
        "meter": "MED-SJ-1137",
        "rut": "12.913.472-2",
        "status": "Al Día",
        "coords": [
          -71.895933,
          -36.847101
        ]
      },
      {
        "id": "ARR-135",
        "type": "arranque",
        "name": "Margarita Henríquez Castillo",
        "meter": "MED-SJ-1135",
        "rut": "12.666.560-0",
        "status": "Al Día",
        "coords": [
          -71.897872,
          -36.847144
        ]
      },
      {
        "id": "ARR-125",
        "type": "arranque",
        "name": "Pedro Castillo Fuentes",
        "meter": "MED-SJ-1125",
        "rut": "11.432.000-8",
        "status": "Al Día",
        "coords": [
          -71.898099,
          -36.847253
        ]
      },
      {
        "id": "ARR-119",
        "type": "arranque",
        "name": "Elizabeth Silva Ramírez",
        "meter": "MED-SJ-1119",
        "rut": "10.691.264-2",
        "status": "Al Día",
        "coords": [
          -71.895454,
          -36.84749
        ]
      },
      {
        "id": "ARR-091",
        "type": "arranque",
        "name": "María Silva Ramírez",
        "meter": "MED-SJ-1091",
        "rut": "19.234.496-1",
        "status": "Al Día",
        "coords": [
          -71.895909,
          -36.848444
        ]
      },
      {
        "id": "ARR-123",
        "type": "arranque",
        "name": "Luis Fuentes Soto",
        "meter": "MED-SJ-1123",
        "rut": "11.185.088-6",
        "status": "Al Día",
        "coords": [
          -71.898642,
          -36.847381
        ]
      },
      {
        "id": "ARR-065",
        "type": "arranque",
        "name": "Pedro López San Martín",
        "meter": "MED-SJ-1065",
        "rut": "16.024.640-2",
        "status": "Al Día",
        "coords": [
          -71.896023,
          -36.849001
        ]
      },
      {
        "id": "ARR-064",
        "type": "arranque",
        "name": "Jorge Morales Guzmán",
        "meter": "MED-SJ-1064",
        "rut": "15.901.184-1",
        "status": "Al Día",
        "coords": [
          -71.895403,
          -36.849046
        ]
      },
      {
        "id": "ARR-136",
        "type": "arranque",
        "name": "Gloria Guzmán Flores",
        "meter": "MED-SJ-1136",
        "rut": "12.790.016-1",
        "status": "Al Día",
        "coords": [
          -71.899895,
          -36.847135
        ]
      },
      {
        "id": "ARR-086",
        "type": "arranque",
        "name": "Manuel Rojas Contreras",
        "meter": "MED-SJ-1086",
        "rut": "18.617.216-5",
        "status": "Al Día",
        "coords": [
          -71.900382,
          -36.848567
        ]
      },
      {
        "id": "ARR-121",
        "type": "arranque",
        "name": "José López San Martín",
        "meter": "MED-SJ-1121",
        "rut": "10.938.176-4",
        "status": "Al Día",
        "coords": [
          -71.892483,
          -36.847451
        ]
      },
      {
        "id": "ARR-101",
        "type": "arranque",
        "name": "José Rivera Henríquez",
        "meter": "MED-SJ-1101",
        "rut": "8.469.056-2",
        "status": "Al Día",
        "coords": [
          -71.892051,
          -36.848016
        ]
      },
      {
        "id": "ARR-034",
        "type": "arranque",
        "name": "Patricia Contreras Alarcón",
        "meter": "MED-SJ-1034",
        "rut": "12.197.504-7",
        "status": "Al Día",
        "coords": [
          -71.892856,
          -36.849933
        ]
      },
      {
        "id": "ARR-111",
        "type": "arranque",
        "name": "María San Martín Salazar",
        "meter": "MED-SJ-1111",
        "rut": "9.703.616-3",
        "status": "Al Día",
        "coords": [
          -71.891604,
          -36.84769
        ]
      },
      {
        "id": "ARR-035",
        "type": "arranque",
        "name": "Margarita Silva Ramírez",
        "meter": "MED-SJ-1035",
        "rut": "12.320.960-8",
        "status": "Al Día",
        "coords": [
          -71.892358,
          -36.849897
        ]
      },
      {
        "id": "ARR-089",
        "type": "arranque",
        "name": "Raúl Soto Espinoza",
        "meter": "MED-SJ-1089",
        "rut": "18.987.584-8",
        "status": "Al Día",
        "coords": [
          -71.891486,
          -36.848456
        ]
      },
      {
        "id": "ARR-108",
        "type": "arranque",
        "name": "Héctor Guzmán Flores",
        "meter": "MED-SJ-1108",
        "rut": "9.333.248-0",
        "status": "Al Día",
        "coords": [
          -71.891232,
          -36.847732
        ]
      },
      {
        "id": "ARR-102",
        "type": "arranque",
        "name": "Carlos Alarcón Cifuentes",
        "meter": "MED-SJ-1102",
        "rut": "8.592.512-3",
        "status": "Al Día",
        "coords": [
          -71.891224,
          -36.847982
        ]
      },
      {
        "id": "ARR-024",
        "type": "arranque",
        "name": "Jorge Guzmán Flores",
        "meter": "MED-SJ-1024",
        "rut": "10.962.944-6",
        "status": "Al Día",
        "coords": [
          -71.892421,
          -36.850629
        ]
      },
      {
        "id": "ARR-118",
        "type": "arranque",
        "name": "Silvia Contreras Alarcón",
        "meter": "MED-SJ-1118",
        "rut": "10.567.808-1",
        "status": "Al Día",
        "coords": [
          -71.891037,
          -36.847492
        ]
      },
      {
        "id": "ARR-140",
        "type": "arranque",
        "name": "Juan González González",
        "meter": "MED-SJ-1140",
        "rut": "13.283.840-5",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.890969,
          -36.847005
        ]
      },
      {
        "id": "ARR-033",
        "type": "arranque",
        "name": "Ana Soto Espinoza",
        "meter": "MED-SJ-1033",
        "rut": "12.074.048-6",
        "status": "Al Día",
        "coords": [
          -71.891576,
          -36.849972
        ]
      },
      {
        "id": "ARR-072",
        "type": "arranque",
        "name": "Carmen Flores Carrasco",
        "meter": "MED-SJ-1072",
        "rut": "16.888.832-0",
        "status": "Al Día",
        "coords": [
          -71.90253,
          -36.848951
        ]
      },
      {
        "id": "ARR-021",
        "type": "arranque",
        "name": "José Ramírez Silva",
        "meter": "MED-SJ-1021",
        "rut": "10.592.576-3",
        "status": "Al Día",
        "coords": [
          -71.892245,
          -36.85125
        ]
      },
      {
        "id": "ARR-096",
        "type": "arranque",
        "name": "Gloria Araya Morales",
        "meter": "MED-SJ-1096",
        "rut": "19.851.776-6",
        "status": "Al Día",
        "coords": [
          -71.890357,
          -36.848214
        ]
      },
      {
        "id": "ARR-122",
        "type": "arranque",
        "name": "Carlos Sepúlveda Rojas",
        "meter": "MED-SJ-1122",
        "rut": "11.061.632-5",
        "status": "Al Día",
        "coords": [
          -71.88975,
          -36.847406
        ]
      },
      {
        "id": "ARR-128",
        "type": "arranque",
        "name": "Héctor Flores Carrasco",
        "meter": "MED-SJ-1128",
        "rut": "11.802.368-2",
        "status": "Al Día",
        "coords": [
          -71.904331,
          -36.84723
        ]
      }
    ]
  },
  "VALV-05": {
    "valveId": "VALV-05",
    "sector": "Ramal Centro Cívico (Escuela Básica, Posta y Sede)",
    "desc_operativa": "Aislamiento del callejón cívico. Permite reparaciones locales protegiendo la continuidad de la troncal principal.",
    "tipo_corte": "Sectorización Equipamiento Comunitario",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "CALV-05"
    ],
    "pipesKm": 0.21,
    "pipesCount": 1,
    "affectedCount": 18,
    "consumers": [
      {
        "id": "ARR-121",
        "type": "arranque",
        "name": "José López San Martín",
        "meter": "MED-SJ-1121",
        "rut": "10.938.176-4",
        "status": "Al Día",
        "coords": [
          -71.892483,
          -36.847451
        ]
      },
      {
        "id": "ARR-101",
        "type": "arranque",
        "name": "José Rivera Henríquez",
        "meter": "MED-SJ-1101",
        "rut": "8.469.056-2",
        "status": "Al Día",
        "coords": [
          -71.892051,
          -36.848016
        ]
      },
      {
        "id": "ARR-111",
        "type": "arranque",
        "name": "María San Martín Salazar",
        "meter": "MED-SJ-1111",
        "rut": "9.703.616-3",
        "status": "Al Día",
        "coords": [
          -71.891604,
          -36.84769
        ]
      },
      {
        "id": "ARR-108",
        "type": "arranque",
        "name": "Héctor Guzmán Flores",
        "meter": "MED-SJ-1108",
        "rut": "9.333.248-0",
        "status": "Al Día",
        "coords": [
          -71.891232,
          -36.847732
        ]
      },
      {
        "id": "ARR-118",
        "type": "arranque",
        "name": "Silvia Contreras Alarcón",
        "meter": "MED-SJ-1118",
        "rut": "10.567.808-1",
        "status": "Al Día",
        "coords": [
          -71.891037,
          -36.847492
        ]
      },
      {
        "id": "ARR-102",
        "type": "arranque",
        "name": "Carlos Alarcón Cifuentes",
        "meter": "MED-SJ-1102",
        "rut": "8.592.512-3",
        "status": "Al Día",
        "coords": [
          -71.891224,
          -36.847982
        ]
      },
      {
        "id": "ARR-140",
        "type": "arranque",
        "name": "Juan González González",
        "meter": "MED-SJ-1140",
        "rut": "13.283.840-5",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.890969,
          -36.847005
        ]
      },
      {
        "id": "ARR-089",
        "type": "arranque",
        "name": "Raúl Soto Espinoza",
        "meter": "MED-SJ-1089",
        "rut": "18.987.584-8",
        "status": "Al Día",
        "coords": [
          -71.891486,
          -36.848456
        ]
      },
      {
        "id": "ARR-096",
        "type": "arranque",
        "name": "Gloria Araya Morales",
        "meter": "MED-SJ-1096",
        "rut": "19.851.776-6",
        "status": "Al Día",
        "coords": [
          -71.890357,
          -36.848214
        ]
      },
      {
        "id": "ARR-035",
        "type": "arranque",
        "name": "Margarita Silva Ramírez",
        "meter": "MED-SJ-1035",
        "rut": "12.320.960-8",
        "status": "Al Día",
        "coords": [
          -71.892358,
          -36.849897
        ]
      },
      {
        "id": "ARR-034",
        "type": "arranque",
        "name": "Patricia Contreras Alarcón",
        "meter": "MED-SJ-1034",
        "rut": "12.197.504-7",
        "status": "Al Día",
        "coords": [
          -71.892856,
          -36.849933
        ]
      },
      {
        "id": "ARR-122",
        "type": "arranque",
        "name": "Carlos Sepúlveda Rojas",
        "meter": "MED-SJ-1122",
        "rut": "11.061.632-5",
        "status": "Al Día",
        "coords": [
          -71.88975,
          -36.847406
        ]
      },
      {
        "id": "ARR-119",
        "type": "arranque",
        "name": "Elizabeth Silva Ramírez",
        "meter": "MED-SJ-1119",
        "rut": "10.691.264-2",
        "status": "Al Día",
        "coords": [
          -71.895454,
          -36.84749
        ]
      },
      {
        "id": "ARR-033",
        "type": "arranque",
        "name": "Ana Soto Espinoza",
        "meter": "MED-SJ-1033",
        "rut": "12.074.048-6",
        "status": "Al Día",
        "coords": [
          -71.891576,
          -36.849972
        ]
      },
      {
        "id": "ARR-137",
        "type": "arranque",
        "name": "Teresa Salazar Valenzuela",
        "meter": "MED-SJ-1137",
        "rut": "12.913.472-2",
        "status": "Al Día",
        "coords": [
          -71.895933,
          -36.847101
        ]
      },
      {
        "id": "ARR-064",
        "type": "arranque",
        "name": "Jorge Morales Guzmán",
        "meter": "MED-SJ-1064",
        "rut": "15.901.184-1",
        "status": "Al Día",
        "coords": [
          -71.895403,
          -36.849046
        ]
      },
      {
        "id": "ARR-024",
        "type": "arranque",
        "name": "Jorge Guzmán Flores",
        "meter": "MED-SJ-1024",
        "rut": "10.962.944-6",
        "status": "Al Día",
        "coords": [
          -71.892421,
          -36.850629
        ]
      },
      {
        "id": "ARR-091",
        "type": "arranque",
        "name": "María Silva Ramírez",
        "meter": "MED-SJ-1091",
        "rut": "19.234.496-1",
        "status": "Al Día",
        "coords": [
          -71.895909,
          -36.848444
        ]
      }
    ]
  },
  "VALV-06": {
    "valveId": "VALV-06",
    "sector": "Ramal Pasaje Los Aromos",
    "desc_operativa": "Corte exclusivo del callejón Los Aromos. Afecta únicamente a las viviendas interiores del pasaje.",
    "tipo_corte": "Sectorización Pasaje Interior",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "CALV-08"
    ],
    "pipesKm": 0.21,
    "pipesCount": 1,
    "affectedCount": 12,
    "consumers": [
      {
        "id": "ARR-122",
        "type": "arranque",
        "name": "Carlos Sepúlveda Rojas",
        "meter": "MED-SJ-1122",
        "rut": "11.061.632-5",
        "status": "Al Día",
        "coords": [
          -71.88975,
          -36.847406
        ]
      },
      {
        "id": "ARR-045",
        "type": "arranque",
        "name": "Pedro Rivera Henríquez",
        "meter": "MED-SJ-1045",
        "rut": "13.555.520-0",
        "status": "Al Día",
        "coords": [
          -71.887169,
          -36.84941
        ]
      },
      {
        "id": "ARR-041",
        "type": "arranque",
        "name": "José Castillo Fuentes",
        "meter": "MED-SJ-1041",
        "rut": "13.061.696-5",
        "status": "Al Día",
        "coords": [
          -71.887063,
          -36.849459
        ]
      },
      {
        "id": "ARR-079",
        "type": "arranque",
        "name": "Elizabeth Henríquez Castillo",
        "meter": "MED-SJ-1079",
        "rut": "17.753.024-7",
        "status": "Al Día",
        "coords": [
          -71.885113,
          -36.848842
        ]
      },
      {
        "id": "ARR-070",
        "type": "arranque",
        "name": "Rosa Torres Torres",
        "meter": "MED-SJ-1070",
        "rut": "16.641.920-7",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.884498,
          -36.848982
        ]
      },
      {
        "id": "ARR-138",
        "type": "arranque",
        "name": "Silvia Cifuentes Reyes",
        "meter": "MED-SJ-1138",
        "rut": "13.036.928-3",
        "status": "Al Día",
        "coords": [
          -71.883494,
          -36.847072
        ]
      },
      {
        "id": "ARR-066",
        "type": "arranque",
        "name": "Manuel Sepúlveda Rojas",
        "meter": "MED-SJ-1066",
        "rut": "16.148.096-3",
        "status": "Al Día",
        "coords": [
          -71.884265,
          -36.848998
        ]
      },
      {
        "id": "ARR-096",
        "type": "arranque",
        "name": "Gloria Araya Morales",
        "meter": "MED-SJ-1096",
        "rut": "19.851.776-6",
        "status": "Al Día",
        "coords": [
          -71.890357,
          -36.848214
        ]
      },
      {
        "id": "ARR-060",
        "type": "arranque",
        "name": "Juan Pérez Araya",
        "meter": "MED-SJ-1060",
        "rut": "15.407.360-6",
        "status": "Al Día",
        "coords": [
          -71.884117,
          -36.849102
        ]
      },
      {
        "id": "ARR-140",
        "type": "arranque",
        "name": "Juan González González",
        "meter": "MED-SJ-1140",
        "rut": "13.283.840-5",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.890969,
          -36.847005
        ]
      },
      {
        "id": "ARR-118",
        "type": "arranque",
        "name": "Silvia Contreras Alarcón",
        "meter": "MED-SJ-1118",
        "rut": "10.567.808-1",
        "status": "Al Día",
        "coords": [
          -71.891037,
          -36.847492
        ]
      },
      {
        "id": "ARR-108",
        "type": "arranque",
        "name": "Héctor Guzmán Flores",
        "meter": "MED-SJ-1108",
        "rut": "9.333.248-0",
        "status": "Al Día",
        "coords": [
          -71.891232,
          -36.847732
        ]
      }
    ]
  },
  "VALV-07": {
    "valveId": "VALV-07",
    "sector": "Derivación Norte Secundario (Callejón El Manzano)",
    "desc_operativa": "Corte exclusivo del ramal El Manzano para reparación de fugas o empalmes de nuevos arranques.",
    "tipo_corte": "Sectorización Pasaje Secundario",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "CALV-11"
    ],
    "pipesKm": 0.43,
    "pipesCount": 1,
    "affectedCount": 15,
    "consumers": [
      {
        "id": "ARR-105",
        "type": "arranque",
        "name": "Pedro Ramírez Silva",
        "meter": "MED-SJ-1105",
        "rut": "8.962.880-6",
        "status": "Al Día",
        "coords": [
          -71.881894,
          -36.847829
        ]
      },
      {
        "id": "ARR-120",
        "type": "arranque",
        "name": "Juan Morales Guzmán",
        "meter": "MED-SJ-1120",
        "rut": "10.814.720-3",
        "status": "Al Día",
        "coords": [
          -71.88061,
          -36.847486
        ]
      },
      {
        "id": "ARR-138",
        "type": "arranque",
        "name": "Silvia Cifuentes Reyes",
        "meter": "MED-SJ-1138",
        "rut": "13.036.928-3",
        "status": "Al Día",
        "coords": [
          -71.883494,
          -36.847072
        ]
      },
      {
        "id": "ARR-134",
        "type": "arranque",
        "name": "Patricia Reyes Sepúlveda",
        "meter": "MED-SJ-1134",
        "rut": "12.543.104-8",
        "status": "Al Día",
        "coords": [
          -71.880254,
          -36.847168
        ]
      },
      {
        "id": "ARR-124",
        "type": "arranque",
        "name": "Jorge Araya Morales",
        "meter": "MED-SJ-1124",
        "rut": "11.308.544-7",
        "status": "Al Día",
        "coords": [
          -71.880181,
          -36.847304
        ]
      },
      {
        "id": "ARR-098",
        "type": "arranque",
        "name": "Silvia Torres Torres",
        "meter": "MED-SJ-1098",
        "rut": "8.098.688-8",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.882785,
          -36.848114
        ]
      },
      {
        "id": "ARR-094",
        "type": "arranque",
        "name": "Patricia Sepúlveda Rojas",
        "meter": "MED-SJ-1094",
        "rut": "19.604.864-4",
        "status": "Al Día",
        "coords": [
          -71.882807,
          -36.848384
        ]
      },
      {
        "id": "ARR-083",
        "type": "arranque",
        "name": "Luis San Martín Salazar",
        "meter": "MED-SJ-1083",
        "rut": "18.246.848-2",
        "status": "Al Día",
        "coords": [
          -71.881561,
          -36.84877
        ]
      },
      {
        "id": "ARR-074",
        "type": "arranque",
        "name": "Patricia Alarcón Cifuentes",
        "meter": "MED-SJ-1074",
        "rut": "17.135.744-2",
        "status": "Al Día",
        "coords": [
          -71.881566,
          -36.848942
        ]
      },
      {
        "id": "ARR-069",
        "type": "arranque",
        "name": "Raúl Castillo Fuentes",
        "meter": "MED-SJ-1069",
        "rut": "16.518.464-6",
        "status": "Al Día",
        "coords": [
          -71.882541,
          -36.848984
        ]
      },
      {
        "id": "ARR-087",
        "type": "arranque",
        "name": "Víctor Díaz López",
        "meter": "MED-SJ-1087",
        "rut": "18.740.672-6",
        "status": "Suspendido por Fuga",
        "coords": [
          -71.880111,
          -36.848542
        ]
      },
      {
        "id": "ARR-056",
        "type": "arranque",
        "name": "Gloria González González",
        "meter": "MED-SJ-1056",
        "rut": "14.913.536-2",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.881662,
          -36.849183
        ]
      },
      {
        "id": "ARR-067",
        "type": "arranque",
        "name": "Víctor Fuentes Soto",
        "meter": "MED-SJ-1067",
        "rut": "16.271.552-4",
        "status": "Al Día",
        "coords": [
          -71.88054,
          -36.848989
        ]
      },
      {
        "id": "ARR-077",
        "type": "arranque",
        "name": "Teresa Ramírez Silva",
        "meter": "MED-SJ-1077",
        "rut": "17.506.112-5",
        "status": "Al Día",
        "coords": [
          -71.88005,
          -36.848883
        ]
      },
      {
        "id": "ARR-050",
        "type": "arranque",
        "name": "Rosa Reyes Sepúlveda",
        "meter": "MED-SJ-1050",
        "rut": "14.172.800-5",
        "status": "Al Día",
        "coords": [
          -71.883014,
          -36.849308
        ]
      }
    ]
  },
  "VALV-08": {
    "valveId": "VALV-08",
    "sector": "Sector Troncal Poniente KM 1.5 (Faja Vial Intermedia)",
    "desc_operativa": "Aislamiento de la troncal poniente en faja vial entre KM 1.0 y KM 2.0.",
    "tipo_corte": "Sectorización Troncal Faja Vial",
    "recovery_time": "1.5 a 2.5 horas (Presurización general de red)",
    "pipes": [
      "CALV-02"
    ],
    "pipesKm": 6.12,
    "pipesCount": 1,
    "affectedCount": 24,
    "consumers": [
      {
        "id": "ARR-139",
        "type": "arranque",
        "name": "Elizabeth San Martín Salazar",
        "meter": "MED-SJ-1139",
        "rut": "13.160.384-4",
        "status": "Al Día",
        "coords": [
          -71.916966,
          -36.847037
        ]
      },
      {
        "id": "ARR-114",
        "type": "arranque",
        "name": "Patricia Rojas Contreras",
        "meter": "MED-SJ-1114",
        "rut": "10.073.984-6",
        "status": "Al Día",
        "coords": [
          -71.916956,
          -36.847524
        ]
      },
      {
        "id": "ARR-117",
        "type": "arranque",
        "name": "Teresa Soto Espinoza",
        "meter": "MED-SJ-1117",
        "rut": "10.444.352-0",
        "status": "Al Día",
        "coords": [
          -71.916499,
          -36.847497
        ]
      },
      {
        "id": "ARR-106",
        "type": "arranque",
        "name": "Manuel Reyes Sepúlveda",
        "meter": "MED-SJ-1106",
        "rut": "9.086.336-7",
        "status": "Al Día",
        "coords": [
          -71.916736,
          -36.847806
        ]
      },
      {
        "id": "ARR-104",
        "type": "arranque",
        "name": "Jorge Carrasco Pérez",
        "meter": "MED-SJ-1104",
        "rut": "8.839.424-5",
        "status": "Al Día",
        "coords": [
          -71.916445,
          -36.847868
        ]
      },
      {
        "id": "ARR-109",
        "type": "arranque",
        "name": "Raúl Salazar Valenzuela",
        "meter": "MED-SJ-1109",
        "rut": "9.456.704-1",
        "status": "Al Día",
        "coords": [
          -71.916245,
          -36.847729
        ]
      },
      {
        "id": "ARR-129",
        "type": "arranque",
        "name": "Raúl Rivera Henríquez",
        "meter": "MED-SJ-1129",
        "rut": "11.925.824-3",
        "status": "Al Día",
        "coords": [
          -71.915538,
          -36.847226
        ]
      },
      {
        "id": "ARR-126",
        "type": "arranque",
        "name": "Manuel Torres Torres",
        "meter": "MED-SJ-1126",
        "rut": "11.555.456-0",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.915257,
          -36.84724
        ]
      },
      {
        "id": "ARR-084",
        "type": "arranque",
        "name": "Jorge González González",
        "meter": "MED-SJ-1084",
        "rut": "18.370.304-3",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.918027,
          -36.848697
        ]
      },
      {
        "id": "ARR-131",
        "type": "arranque",
        "name": "María Valenzuela Muñoz",
        "meter": "MED-SJ-1131",
        "rut": "12.172.736-5",
        "status": "Al Día",
        "coords": [
          -71.91437,
          -36.847202
        ]
      },
      {
        "id": "ARR-130",
        "type": "arranque",
        "name": "Rosa Alarcón Cifuentes",
        "meter": "MED-SJ-1130",
        "rut": "12.049.280-4",
        "status": "Al Día",
        "coords": [
          -71.914015,
          -36.847211
        ]
      },
      {
        "id": "ARR-127",
        "type": "arranque",
        "name": "Víctor Espinoza Rivera",
        "meter": "MED-SJ-1127",
        "rut": "11.678.912-1",
        "status": "Al Día",
        "coords": [
          -71.913813,
          -36.84724
        ]
      },
      {
        "id": "ARR-132",
        "type": "arranque",
        "name": "Carmen Carrasco Pérez",
        "meter": "MED-SJ-1132",
        "rut": "12.296.192-6",
        "status": "Al Día",
        "coords": [
          -71.913648,
          -36.847185
        ]
      },
      {
        "id": "ARR-099",
        "type": "arranque",
        "name": "Elizabeth Espinoza Rivera",
        "meter": "MED-SJ-1099",
        "rut": "8.222.144-0",
        "status": "Al Día",
        "coords": [
          -71.920556,
          -36.848074
        ]
      },
      {
        "id": "ARR-103",
        "type": "arranque",
        "name": "Luis Valenzuela Muñoz",
        "meter": "MED-SJ-1103",
        "rut": "8.715.968-4",
        "status": "Al Día",
        "coords": [
          -71.921032,
          -36.847932
        ]
      },
      {
        "id": "ARR-097",
        "type": "arranque",
        "name": "Teresa Castillo Fuentes",
        "meter": "MED-SJ-1097",
        "rut": "19.975.232-7",
        "status": "Al Día",
        "coords": [
          -71.922416,
          -36.84812
        ]
      },
      {
        "id": "ARR-075",
        "type": "arranque",
        "name": "Margarita Valenzuela Muñoz",
        "meter": "MED-SJ-1075",
        "rut": "17.259.200-3",
        "status": "Al Día",
        "coords": [
          -71.923121,
          -36.848931
        ]
      },
      {
        "id": "ARR-071",
        "type": "arranque",
        "name": "María Espinoza Rivera",
        "meter": "MED-SJ-1071",
        "rut": "16.765.376-8",
        "status": "Al Día",
        "coords": [
          -71.923653,
          -36.848974
        ]
      },
      {
        "id": "ARR-110",
        "type": "arranque",
        "name": "Rosa Cifuentes Reyes",
        "meter": "MED-SJ-1110",
        "rut": "9.580.160-2",
        "status": "Al Día",
        "coords": [
          -71.909225,
          -36.847711
        ]
      },
      {
        "id": "ARR-092",
        "type": "arranque",
        "name": "Carmen Morales Guzmán",
        "meter": "MED-SJ-1092",
        "rut": "19.357.952-2",
        "status": "Al Día",
        "coords": [
          -71.924986,
          -36.848438
        ]
      },
      {
        "id": "ARR-078",
        "type": "arranque",
        "name": "Silvia Reyes Sepúlveda",
        "meter": "MED-SJ-1078",
        "rut": "17.629.568-6",
        "status": "Al Día",
        "coords": [
          -71.927559,
          -36.848852
        ]
      },
      {
        "id": "ARR-023",
        "type": "arranque",
        "name": "Luis Henríquez Castillo",
        "meter": "MED-SJ-1023",
        "rut": "10.839.488-5",
        "status": "Al Día",
        "coords": [
          -71.906413,
          -36.85079
        ]
      },
      {
        "id": "ARR-020",
        "type": "arranque",
        "name": "Juan Carrasco Pérez",
        "meter": "MED-SJ-1020",
        "rut": "10.469.120-2",
        "status": "Al Día",
        "coords": [
          -71.906379,
          -36.851348
        ]
      },
      {
        "id": "ARR-022",
        "type": "arranque",
        "name": "Carlos Reyes Sepúlveda",
        "meter": "MED-SJ-1022",
        "rut": "10.716.032-4",
        "status": "Al Día",
        "coords": [
          -71.906087,
          -36.850898
        ]
      }
    ]
  },
  "VALV-09": {
    "valveId": "VALV-09",
    "sector": "Sector El Calvario Centro (Sede Comunitaria y Entorno)",
    "desc_operativa": "Aislamiento del nudo central de El Calvario para trabajos en la bifurcación vecinal.",
    "tipo_corte": "Sectorización Sector Centro El Calvario",
    "recovery_time": "40 a 60 min (Purga de aire y presurización)",
    "pipes": [
      "CALV-09",
      "CALV-12"
    ],
    "pipesKm": 2.56,
    "pipesCount": 2,
    "affectedCount": 28,
    "consumers": [
      {
        "id": "ARR-030",
        "type": "arranque",
        "name": "Rosa Rojas Contreras",
        "meter": "MED-SJ-1030",
        "rut": "11.703.680-3",
        "status": "Al Día",
        "coords": [
          -71.938644,
          -36.850192
        ]
      },
      {
        "id": "ARR-025",
        "type": "arranque",
        "name": "Sede Social y Cancha SSR El Calvario",
        "meter": "MED-SJ-1025",
        "rut": "11.086.400-7",
        "status": "Al Día",
        "coords": [
          -71.938007,
          -36.850527
        ]
      },
      {
        "id": "ARR-027",
        "type": "arranque",
        "name": "Víctor San Martín Salazar",
        "meter": "MED-SJ-1027",
        "rut": "11.333.312-0",
        "status": "Al Día",
        "coords": [
          -71.937838,
          -36.85042
        ]
      },
      {
        "id": "ARR-028",
        "type": "arranque",
        "name": "Héctor González González",
        "meter": "MED-SJ-1028",
        "rut": "11.456.768-1",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.937395,
          -36.850342
        ]
      },
      {
        "id": "ARR-038",
        "type": "arranque",
        "name": "Silvia Sepúlveda Rojas",
        "meter": "MED-SJ-1038",
        "rut": "12.691.328-2",
        "status": "Al Día",
        "coords": [
          -71.936729,
          -36.849598
        ]
      },
      {
        "id": "ARR-047",
        "type": "arranque",
        "name": "Víctor Valenzuela Muñoz",
        "meter": "MED-SJ-1047",
        "rut": "13.802.432-2",
        "status": "Al Día",
        "coords": [
          -71.936198,
          -36.849365
        ]
      },
      {
        "id": "ARR-040",
        "type": "arranque",
        "name": "Juan Araya Morales",
        "meter": "MED-SJ-1040",
        "rut": "12.938.240-4",
        "status": "Al Día",
        "coords": [
          -71.936055,
          -36.849474
        ]
      },
      {
        "id": "ARR-053",
        "type": "arranque",
        "name": "Ana Salazar Valenzuela",
        "meter": "MED-SJ-1053",
        "rut": "14.543.168-8",
        "status": "Al Día",
        "coords": [
          -71.936045,
          -36.849242
        ]
      },
      {
        "id": "ARR-031",
        "type": "arranque",
        "name": "María Díaz López",
        "meter": "MED-SJ-1031",
        "rut": "11.827.136-4",
        "status": "Al Día",
        "coords": [
          -71.935763,
          -36.850038
        ]
      },
      {
        "id": "ARR-032",
        "type": "arranque",
        "name": "Carmen Pérez Araya",
        "meter": "MED-SJ-1032",
        "rut": "11.950.592-5",
        "status": "Al Día",
        "coords": [
          -71.935592,
          -36.849981
        ]
      },
      {
        "id": "ARR-054",
        "type": "arranque",
        "name": "Patricia Cifuentes Reyes",
        "meter": "MED-SJ-1054",
        "rut": "14.666.624-0",
        "status": "Al Día",
        "coords": [
          -71.935788,
          -36.849228
        ]
      },
      {
        "id": "ARR-085",
        "type": "arranque",
        "name": "Pedro Muñoz Díaz",
        "meter": "MED-SJ-1085",
        "rut": "18.493.760-4",
        "status": "Al Día",
        "coords": [
          -71.936046,
          -36.848586
        ]
      },
      {
        "id": "ARR-042",
        "type": "arranque",
        "name": "Carlos Torres Torres",
        "meter": "MED-SJ-1042",
        "rut": "13.185.152-6",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.93533,
          -36.849443
        ]
      },
      {
        "id": "ARR-043",
        "type": "arranque",
        "name": "Luis Espinoza Rivera",
        "meter": "MED-SJ-1043",
        "rut": "13.308.608-7",
        "status": "Al Día",
        "coords": [
          -71.934986,
          -36.849414
        ]
      },
      {
        "id": "ARR-046",
        "type": "arranque",
        "name": "Manuel Alarcón Cifuentes",
        "meter": "MED-SJ-1046",
        "rut": "13.678.976-1",
        "status": "Al Día",
        "coords": [
          -71.934637,
          -36.849367
        ]
      },
      {
        "id": "ARR-051",
        "type": "arranque",
        "name": "María Henríquez Castillo",
        "meter": "MED-SJ-1051",
        "rut": "14.296.256-6",
        "status": "Al Día",
        "coords": [
          -71.933274,
          -36.849277
        ]
      },
      {
        "id": "ARR-082",
        "type": "arranque",
        "name": "Carlos Cifuentes Reyes",
        "meter": "MED-SJ-1082",
        "rut": "18.123.392-1",
        "status": "Al Día",
        "coords": [
          -71.93338,
          -36.848811
        ]
      },
      {
        "id": "ARR-049",
        "type": "arranque",
        "name": "Raúl Ramírez Silva",
        "meter": "MED-SJ-1049",
        "rut": "14.049.344-4",
        "status": "Al Día",
        "coords": [
          -71.933061,
          -36.84933
        ]
      },
      {
        "id": "ARR-061",
        "type": "arranque",
        "name": "José Soto Espinoza",
        "meter": "MED-SJ-1061",
        "rut": "15.530.816-7",
        "status": "Al Día",
        "coords": [
          -71.933028,
          -36.849078
        ]
      },
      {
        "id": "ARR-057",
        "type": "arranque",
        "name": "Teresa Muñoz Díaz",
        "meter": "MED-SJ-1057",
        "rut": "15.036.992-3",
        "status": "Al Día",
        "coords": [
          -71.932991,
          -36.849167
        ]
      },
      {
        "id": "ARR-059",
        "type": "arranque",
        "name": "Elizabeth Díaz López",
        "meter": "MED-SJ-1059",
        "rut": "15.283.904-5",
        "status": "Al Día",
        "coords": [
          -71.932681,
          -36.849121
        ]
      },
      {
        "id": "ARR-081",
        "type": "arranque",
        "name": "José Salazar Valenzuela",
        "meter": "MED-SJ-1081",
        "rut": "17.999.936-0",
        "status": "Al Día",
        "coords": [
          -71.932582,
          -36.848816
        ]
      },
      {
        "id": "ARR-052",
        "type": "arranque",
        "name": "Carmen Guzmán Flores",
        "meter": "MED-SJ-1052",
        "rut": "14.419.712-7",
        "status": "Al Día",
        "coords": [
          -71.932451,
          -36.849261
        ]
      },
      {
        "id": "ARR-055",
        "type": "arranque",
        "name": "Margarita San Martín Salazar",
        "meter": "MED-SJ-1055",
        "rut": "14.790.080-1",
        "status": "Al Día",
        "coords": [
          -71.931928,
          -36.849197
        ]
      },
      {
        "id": "ARR-036",
        "type": "arranque",
        "name": "Gloria Morales Guzmán",
        "meter": "MED-SJ-1036",
        "rut": "12.444.416-0",
        "status": "Al Día",
        "coords": [
          -71.929171,
          -36.849747
        ]
      },
      {
        "id": "ARR-039",
        "type": "arranque",
        "name": "Elizabeth Fuentes Soto",
        "meter": "MED-SJ-1039",
        "rut": "12.814.784-3",
        "status": "Al Día",
        "coords": [
          -71.92905,
          -36.849553
        ]
      },
      {
        "id": "ARR-044",
        "type": "arranque",
        "name": "Jorge Flores Carrasco",
        "meter": "MED-SJ-1044",
        "rut": "13.432.064-8",
        "status": "Al Día",
        "coords": [
          -71.928725,
          -36.849412
        ]
      },
      {
        "id": "ARR-048",
        "type": "arranque",
        "name": "Héctor Carrasco Pérez",
        "meter": "MED-SJ-1048",
        "rut": "13.925.888-3",
        "status": "Al Día",
        "coords": [
          -71.928301,
          -36.849358
        ]
      }
    ]
  },
  "VALV-10": {
    "valveId": "VALV-10",
    "sector": "Ramal Loteo Los Boldos",
    "desc_operativa": "Aislamiento específico del ramal y pasajes de acceso al Loteo Los Boldos.",
    "tipo_corte": "Sectorización Loteo Interior",
    "recovery_time": "20 a 30 min (Llenado progresivo)",
    "pipes": [
      "CALV-10"
    ],
    "pipesKm": 0.86,
    "pipesCount": 1,
    "affectedCount": 26,
    "consumers": [
      {
        "id": "ARR-030",
        "type": "arranque",
        "name": "Rosa Rojas Contreras",
        "meter": "MED-SJ-1030",
        "rut": "11.703.680-3",
        "status": "Al Día",
        "coords": [
          -71.938644,
          -36.850192
        ]
      },
      {
        "id": "ARR-025",
        "type": "arranque",
        "name": "Sede Social y Cancha SSR El Calvario",
        "meter": "MED-SJ-1025",
        "rut": "11.086.400-7",
        "status": "Al Día",
        "coords": [
          -71.938007,
          -36.850527
        ]
      },
      {
        "id": "ARR-027",
        "type": "arranque",
        "name": "Víctor San Martín Salazar",
        "meter": "MED-SJ-1027",
        "rut": "11.333.312-0",
        "status": "Al Día",
        "coords": [
          -71.937838,
          -36.85042
        ]
      },
      {
        "id": "ARR-028",
        "type": "arranque",
        "name": "Héctor González González",
        "meter": "MED-SJ-1028",
        "rut": "11.456.768-1",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.937395,
          -36.850342
        ]
      },
      {
        "id": "ARR-038",
        "type": "arranque",
        "name": "Silvia Sepúlveda Rojas",
        "meter": "MED-SJ-1038",
        "rut": "12.691.328-2",
        "status": "Al Día",
        "coords": [
          -71.936729,
          -36.849598
        ]
      },
      {
        "id": "ARR-047",
        "type": "arranque",
        "name": "Víctor Valenzuela Muñoz",
        "meter": "MED-SJ-1047",
        "rut": "13.802.432-2",
        "status": "Al Día",
        "coords": [
          -71.936198,
          -36.849365
        ]
      },
      {
        "id": "ARR-040",
        "type": "arranque",
        "name": "Juan Araya Morales",
        "meter": "MED-SJ-1040",
        "rut": "12.938.240-4",
        "status": "Al Día",
        "coords": [
          -71.936055,
          -36.849474
        ]
      },
      {
        "id": "ARR-053",
        "type": "arranque",
        "name": "Ana Salazar Valenzuela",
        "meter": "MED-SJ-1053",
        "rut": "14.543.168-8",
        "status": "Al Día",
        "coords": [
          -71.936045,
          -36.849242
        ]
      },
      {
        "id": "ARR-085",
        "type": "arranque",
        "name": "Pedro Muñoz Díaz",
        "meter": "MED-SJ-1085",
        "rut": "18.493.760-4",
        "status": "Al Día",
        "coords": [
          -71.936046,
          -36.848586
        ]
      },
      {
        "id": "ARR-031",
        "type": "arranque",
        "name": "María Díaz López",
        "meter": "MED-SJ-1031",
        "rut": "11.827.136-4",
        "status": "Al Día",
        "coords": [
          -71.935763,
          -36.850038
        ]
      },
      {
        "id": "ARR-054",
        "type": "arranque",
        "name": "Patricia Cifuentes Reyes",
        "meter": "MED-SJ-1054",
        "rut": "14.666.624-0",
        "status": "Al Día",
        "coords": [
          -71.935788,
          -36.849228
        ]
      },
      {
        "id": "ARR-032",
        "type": "arranque",
        "name": "Carmen Pérez Araya",
        "meter": "MED-SJ-1032",
        "rut": "11.950.592-5",
        "status": "Al Día",
        "coords": [
          -71.935592,
          -36.849981
        ]
      },
      {
        "id": "ARR-042",
        "type": "arranque",
        "name": "Carlos Torres Torres",
        "meter": "MED-SJ-1042",
        "rut": "13.185.152-6",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.93533,
          -36.849443
        ]
      },
      {
        "id": "ARR-043",
        "type": "arranque",
        "name": "Luis Espinoza Rivera",
        "meter": "MED-SJ-1043",
        "rut": "13.308.608-7",
        "status": "Al Día",
        "coords": [
          -71.934986,
          -36.849414
        ]
      },
      {
        "id": "ARR-046",
        "type": "arranque",
        "name": "Manuel Alarcón Cifuentes",
        "meter": "MED-SJ-1046",
        "rut": "13.678.976-1",
        "status": "Al Día",
        "coords": [
          -71.934637,
          -36.849367
        ]
      },
      {
        "id": "ARR-082",
        "type": "arranque",
        "name": "Carlos Cifuentes Reyes",
        "meter": "MED-SJ-1082",
        "rut": "18.123.392-1",
        "status": "Al Día",
        "coords": [
          -71.93338,
          -36.848811
        ]
      },
      {
        "id": "ARR-051",
        "type": "arranque",
        "name": "María Henríquez Castillo",
        "meter": "MED-SJ-1051",
        "rut": "14.296.256-6",
        "status": "Al Día",
        "coords": [
          -71.933274,
          -36.849277
        ]
      },
      {
        "id": "ARR-049",
        "type": "arranque",
        "name": "Raúl Ramírez Silva",
        "meter": "MED-SJ-1049",
        "rut": "14.049.344-4",
        "status": "Al Día",
        "coords": [
          -71.933061,
          -36.84933
        ]
      },
      {
        "id": "ARR-061",
        "type": "arranque",
        "name": "José Soto Espinoza",
        "meter": "MED-SJ-1061",
        "rut": "15.530.816-7",
        "status": "Al Día",
        "coords": [
          -71.933028,
          -36.849078
        ]
      },
      {
        "id": "ARR-057",
        "type": "arranque",
        "name": "Teresa Muñoz Díaz",
        "meter": "MED-SJ-1057",
        "rut": "15.036.992-3",
        "status": "Al Día",
        "coords": [
          -71.932991,
          -36.849167
        ]
      },
      {
        "id": "ARR-059",
        "type": "arranque",
        "name": "Elizabeth Díaz López",
        "meter": "MED-SJ-1059",
        "rut": "15.283.904-5",
        "status": "Al Día",
        "coords": [
          -71.932681,
          -36.849121
        ]
      },
      {
        "id": "ARR-081",
        "type": "arranque",
        "name": "José Salazar Valenzuela",
        "meter": "MED-SJ-1081",
        "rut": "17.999.936-0",
        "status": "Al Día",
        "coords": [
          -71.932582,
          -36.848816
        ]
      },
      {
        "id": "ARR-052",
        "type": "arranque",
        "name": "Carmen Guzmán Flores",
        "meter": "MED-SJ-1052",
        "rut": "14.419.712-7",
        "status": "Al Día",
        "coords": [
          -71.932451,
          -36.849261
        ]
      },
      {
        "id": "ARR-055",
        "type": "arranque",
        "name": "Margarita San Martín Salazar",
        "meter": "MED-SJ-1055",
        "rut": "14.790.080-1",
        "status": "Al Día",
        "coords": [
          -71.931928,
          -36.849197
        ]
      },
      {
        "id": "ARR-036",
        "type": "arranque",
        "name": "Gloria Morales Guzmán",
        "meter": "MED-SJ-1036",
        "rut": "12.444.416-0",
        "status": "Al Día",
        "coords": [
          -71.929171,
          -36.849747
        ]
      },
      {
        "id": "ARR-039",
        "type": "arranque",
        "name": "Elizabeth Fuentes Soto",
        "meter": "MED-SJ-1039",
        "rut": "12.814.784-3",
        "status": "Al Día",
        "coords": [
          -71.92905,
          -36.849553
        ]
      }
    ]
  },
  "VALV-11": {
    "valveId": "VALV-11",
    "sector": "Cámara Interconexión Santa Juana Nº9 - El Calvario",
    "desc_operativa": "Maniobra de válvula de bypass entre ambos sistemas SSR. En operación normal aísla el enlace de emergencia.",
    "tipo_corte": "Maniobra de Interconexión / Bypass",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "CALV-14"
    ],
    "pipesKm": 0.32,
    "pipesCount": 1,
    "affectedCount": 4,
    "consumers": [
      {
        "id": "ARR-030",
        "type": "arranque",
        "name": "Rosa Rojas Contreras",
        "meter": "MED-SJ-1030",
        "rut": "11.703.680-3",
        "status": "Al Día",
        "coords": [
          -71.938644,
          -36.850192
        ]
      },
      {
        "id": "ARR-025",
        "type": "arranque",
        "name": "Sede Social y Cancha SSR El Calvario",
        "meter": "MED-SJ-1025",
        "rut": "11.086.400-7",
        "status": "Al Día",
        "coords": [
          -71.938007,
          -36.850527
        ]
      },
      {
        "id": "ARR-027",
        "type": "arranque",
        "name": "Víctor San Martín Salazar",
        "meter": "MED-SJ-1027",
        "rut": "11.333.312-0",
        "status": "Al Día",
        "coords": [
          -71.937838,
          -36.85042
        ]
      },
      {
        "id": "ARR-028",
        "type": "arranque",
        "name": "Héctor González González",
        "meter": "MED-SJ-1028",
        "rut": "11.456.768-1",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.937395,
          -36.850342
        ]
      }
    ]
  },
  "VALV-12": {
    "valveId": "VALV-12",
    "sector": "Sector Callejón Los Pinos",
    "desc_operativa": "Aislamiento exclusivo del callejón Los Pinos para reparaciones menores de tubería o llaves de paso.",
    "tipo_corte": "Sectorización Callejón Los Pinos",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "CALV-13"
    ],
    "pipesKm": 0.32,
    "pipesCount": 1,
    "affectedCount": 19,
    "consumers": [
      {
        "id": "ARR-110",
        "type": "arranque",
        "name": "Rosa Cifuentes Reyes",
        "meter": "MED-SJ-1110",
        "rut": "9.580.160-2",
        "status": "Al Día",
        "coords": [
          -71.909225,
          -36.847711
        ]
      },
      {
        "id": "ARR-128",
        "type": "arranque",
        "name": "Héctor Flores Carrasco",
        "meter": "MED-SJ-1128",
        "rut": "11.802.368-2",
        "status": "Al Día",
        "coords": [
          -71.904331,
          -36.84723
        ]
      },
      {
        "id": "ARR-023",
        "type": "arranque",
        "name": "Luis Henríquez Castillo",
        "meter": "MED-SJ-1023",
        "rut": "10.839.488-5",
        "status": "Al Día",
        "coords": [
          -71.906413,
          -36.85079
        ]
      },
      {
        "id": "ARR-022",
        "type": "arranque",
        "name": "Carlos Reyes Sepúlveda",
        "meter": "MED-SJ-1022",
        "rut": "10.716.032-4",
        "status": "Al Día",
        "coords": [
          -71.906087,
          -36.850898
        ]
      },
      {
        "id": "ARR-020",
        "type": "arranque",
        "name": "Juan Carrasco Pérez",
        "meter": "MED-SJ-1020",
        "rut": "10.469.120-2",
        "status": "Al Día",
        "coords": [
          -71.906379,
          -36.851348
        ]
      },
      {
        "id": "ARR-072",
        "type": "arranque",
        "name": "Carmen Flores Carrasco",
        "meter": "MED-SJ-1072",
        "rut": "16.888.832-0",
        "status": "Al Día",
        "coords": [
          -71.90253,
          -36.848951
        ]
      },
      {
        "id": "ARR-019",
        "type": "arranque",
        "name": "Elizabeth Valenzuela Muñoz",
        "meter": "MED-SJ-1019",
        "rut": "10.345.664-1",
        "status": "Al Día",
        "coords": [
          -71.906165,
          -36.851804
        ]
      },
      {
        "id": "ARR-132",
        "type": "arranque",
        "name": "Carmen Carrasco Pérez",
        "meter": "MED-SJ-1132",
        "rut": "12.296.192-6",
        "status": "Al Día",
        "coords": [
          -71.913648,
          -36.847185
        ]
      },
      {
        "id": "ARR-127",
        "type": "arranque",
        "name": "Víctor Espinoza Rivera",
        "meter": "MED-SJ-1127",
        "rut": "11.678.912-1",
        "status": "Al Día",
        "coords": [
          -71.913813,
          -36.84724
        ]
      },
      {
        "id": "ARR-086",
        "type": "arranque",
        "name": "Manuel Rojas Contreras",
        "meter": "MED-SJ-1086",
        "rut": "18.617.216-5",
        "status": "Al Día",
        "coords": [
          -71.900382,
          -36.848567
        ]
      },
      {
        "id": "ARR-130",
        "type": "arranque",
        "name": "Rosa Alarcón Cifuentes",
        "meter": "MED-SJ-1130",
        "rut": "12.049.280-4",
        "status": "Al Día",
        "coords": [
          -71.914015,
          -36.847211
        ]
      },
      {
        "id": "ARR-136",
        "type": "arranque",
        "name": "Gloria Guzmán Flores",
        "meter": "MED-SJ-1136",
        "rut": "12.790.016-1",
        "status": "Al Día",
        "coords": [
          -71.899895,
          -36.847135
        ]
      },
      {
        "id": "ARR-131",
        "type": "arranque",
        "name": "María Valenzuela Muñoz",
        "meter": "MED-SJ-1131",
        "rut": "12.172.736-5",
        "status": "Al Día",
        "coords": [
          -71.91437,
          -36.847202
        ]
      },
      {
        "id": "ARR-126",
        "type": "arranque",
        "name": "Manuel Torres Torres",
        "meter": "MED-SJ-1126",
        "rut": "11.555.456-0",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.915257,
          -36.84724
        ]
      },
      {
        "id": "ARR-123",
        "type": "arranque",
        "name": "Luis Fuentes Soto",
        "meter": "MED-SJ-1123",
        "rut": "11.185.088-6",
        "status": "Al Día",
        "coords": [
          -71.898642,
          -36.847381
        ]
      },
      {
        "id": "ARR-129",
        "type": "arranque",
        "name": "Raúl Rivera Henríquez",
        "meter": "MED-SJ-1129",
        "rut": "11.925.824-3",
        "status": "Al Día",
        "coords": [
          -71.915538,
          -36.847226
        ]
      },
      {
        "id": "ARR-125",
        "type": "arranque",
        "name": "Pedro Castillo Fuentes",
        "meter": "MED-SJ-1125",
        "rut": "11.432.000-8",
        "status": "Al Día",
        "coords": [
          -71.898099,
          -36.847253
        ]
      },
      {
        "id": "ARR-135",
        "type": "arranque",
        "name": "Margarita Henríquez Castillo",
        "meter": "MED-SJ-1135",
        "rut": "12.666.560-0",
        "status": "Al Día",
        "coords": [
          -71.897872,
          -36.847144
        ]
      },
      {
        "id": "ARR-109",
        "type": "arranque",
        "name": "Raúl Salazar Valenzuela",
        "meter": "MED-SJ-1109",
        "rut": "9.456.704-1",
        "status": "Al Día",
        "coords": [
          -71.916245,
          -36.847729
        ]
      }
    ]
  },
  "VALV-13": {
    "valveId": "VALV-13",
    "sector": "Corte General SSR Santa Juana Nº9 (Salida Estanque Cabecera 110 mm)",
    "desc_operativa": "Corte general de cabecera. Solo se acciona en roturas de matriz troncal a la salida inmediata o mantenimiento mayor de torre.",
    "tipo_corte": "Corte General Mayor",
    "recovery_time": "1.5 a 2.5 horas (Presurización general de red)",
    "pipes": [
      "TUB-01",
      "TUB-02",
      "TUB-03",
      "TUB-04",
      "TUB-05",
      "TUB-06",
      "TUB-07",
      "TUB-08",
      "TUB-09",
      "TUB-10",
      "TUB-11",
      "TUB-12",
      "TUB-13",
      "TUB-14",
      "TUB-15",
      "TUB-16",
      "TUB-17",
      "TUB-18",
      "TUB-19",
      "TUB-20",
      "TUB-21",
      "TUB-22",
      "TUB-23",
      "TUB-24",
      "TUB-25",
      "TUB-26",
      "TUB-27",
      "TUB-28",
      "TUB-29",
      "TUB-30",
      "TUB-31",
      "TUB-32",
      "TUB-33",
      "TUB-34",
      "TUB-35",
      "TUB-36",
      "TUB-37",
      "TUB-38",
      "TUB-39",
      "TUB-40",
      "TUB-41",
      "TUB-42",
      "TUB-43"
    ],
    "pipesKm": 3.58,
    "pipesCount": 43,
    "affectedCount": 152,
    "consumers": [
      {
        "id": "ARR-N9-001",
        "type": "arranque",
        "name": "Oscar Pino Reyes",
        "meter": "MED-N9-2001",
        "rut": "11.212.671-6",
        "status": "Al Día",
        "coords": [
          -71.968888,
          -36.850185
        ]
      },
      {
        "id": "ARR-N9-002",
        "type": "arranque",
        "name": "Ana Garrido Barrientos",
        "meter": "MED-N9-2002",
        "rut": "10.031.660-9",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.96905,
          -36.850149
        ]
      },
      {
        "id": "ARR-N9-003",
        "type": "arranque",
        "name": "Héctor Vera Mardones",
        "meter": "MED-N9-2003",
        "rut": "14.230.433-3",
        "status": "Al Día",
        "coords": [
          -71.970935,
          -36.850017
        ]
      },
      {
        "id": "ARR-N9-004",
        "type": "arranque",
        "name": "José Muñoz Cifuentes",
        "meter": "MED-N9-2004",
        "rut": "11.248.225-3",
        "status": "Al Día",
        "coords": [
          -71.969571,
          -36.849969
        ]
      },
      {
        "id": "ARR-N9-005",
        "type": "arranque",
        "name": "Ricardo Garrido Pérez",
        "meter": "MED-N9-2005",
        "rut": "12.402.734-9",
        "status": "Al Día",
        "coords": [
          -71.970279,
          -36.8499
        ]
      },
      {
        "id": "ARR-N9-006",
        "type": "arranque",
        "name": "Claudia Alarcón Garrido",
        "meter": "MED-N9-2006",
        "rut": "17.812.785-3",
        "status": "Al Día",
        "coords": [
          -71.974233,
          -36.849822
        ]
      },
      {
        "id": "ARR-N9-007",
        "type": "arranque",
        "name": "Gonzalo Fuentes Rebolledo",
        "meter": "MED-N9-2007",
        "rut": "86.569.76-0",
        "status": "Al Día",
        "coords": [
          -71.973812,
          -36.849768
        ]
      },
      {
        "id": "ARR-N9-008",
        "type": "arranque",
        "name": "Gladys Valenzuela Pérez",
        "meter": "MED-N9-2008",
        "rut": "11.511.255-4",
        "status": "Al Día",
        "coords": [
          -71.970166,
          -36.849661
        ]
      },
      {
        "id": "ARR-N9-009",
        "type": "arranque",
        "name": "Carolina Ortiz Flores",
        "meter": "MED-N9-2009",
        "rut": "87.318.23-0",
        "status": "Al Día",
        "coords": [
          -71.970707,
          -36.849548
        ]
      },
      {
        "id": "ARR-N9-010",
        "type": "arranque",
        "name": "Javiera Vera Espinoza",
        "meter": "MED-N9-2010",
        "rut": "10.502.891-1",
        "status": "Al Día",
        "coords": [
          -71.976228,
          -36.849544
        ]
      },
      {
        "id": "ARR-N9-011",
        "type": "arranque",
        "name": "Patricio Rivas Martínez",
        "meter": "MED-N9-2011",
        "rut": "11.019.007-7",
        "status": "Al Día",
        "coords": [
          -71.978807,
          -36.849319
        ]
      },
      {
        "id": "ARR-N9-012",
        "type": "arranque",
        "name": "Ricardo Mardones Godoy",
        "meter": "MED-N9-2012",
        "rut": "10.108.486-8",
        "status": "Al Día",
        "coords": [
          -71.975846,
          -36.849223
        ]
      },
      {
        "id": "ARR-N9-013",
        "type": "arranque",
        "name": "Nelson Villalobos Inostroza",
        "meter": "MED-N9-2013",
        "rut": "11.592.394-3",
        "status": "Al Día",
        "coords": [
          -71.973319,
          -36.849213
        ]
      },
      {
        "id": "ARR-N9-014",
        "type": "arranque",
        "name": "Francisca Montecinos Soto",
        "meter": "MED-N9-2014",
        "rut": "15.433.196-4",
        "status": "Al Día",
        "coords": [
          -71.978733,
          -36.849188
        ]
      },
      {
        "id": "ARR-N9-015",
        "type": "arranque",
        "name": "Andrés Salgado Ortiz",
        "meter": "MED-N9-2015",
        "rut": "18.083.731-0",
        "status": "Al Día",
        "coords": [
          -71.972082,
          -36.849175
        ]
      },
      {
        "id": "ARR-N9-016",
        "type": "arranque",
        "name": "Ramón Acuña Guíñez",
        "meter": "MED-N9-2016",
        "rut": "94.932.53-K",
        "status": "Al Día",
        "coords": [
          -71.979452,
          -36.84917
        ]
      },
      {
        "id": "ARR-N9-017",
        "type": "arranque",
        "name": "Cristián Salgado Troncoso",
        "meter": "MED-N9-2017",
        "rut": "96.400.78-0",
        "status": "Al Día",
        "coords": [
          -71.979807,
          -36.849169
        ]
      },
      {
        "id": "ARR-N9-018",
        "type": "arranque",
        "name": "Silvia Sandoval Fuentes",
        "meter": "MED-N9-2018",
        "rut": "16.035.843-2",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.974594,
          -36.84914
        ]
      },
      {
        "id": "ARR-N9-019",
        "type": "arranque",
        "name": "Pedro Figueroa Castillo",
        "meter": "MED-N9-2019",
        "rut": "10.782.876-1",
        "status": "Al Día",
        "coords": [
          -71.974796,
          -36.849136
        ]
      },
      {
        "id": "ARR-N9-020",
        "type": "arranque",
        "name": "Gabriela Rebolledo Vera",
        "meter": "MED-N9-2020",
        "rut": "15.159.619-3",
        "status": "Al Día",
        "coords": [
          -71.978689,
          -36.849122
        ]
      },
      {
        "id": "ARR-N9-021",
        "type": "arranque",
        "name": "Héctor Ortiz Fuentes",
        "meter": "MED-N9-2021",
        "rut": "14.680.819-0",
        "status": "Al Día",
        "coords": [
          -71.974101,
          -36.849107
        ]
      },
      {
        "id": "ARR-N9-022",
        "type": "arranque",
        "name": "Álvaro Figueroa Araya",
        "meter": "MED-N9-2022",
        "rut": "15.618.434-9",
        "status": "Al Día",
        "coords": [
          -71.97932,
          -36.849102
        ]
      },
      {
        "id": "ARR-N9-023",
        "type": "arranque",
        "name": "Juana Sandoval Baeza",
        "meter": "MED-N9-2023",
        "rut": "91.847.14-0",
        "status": "Al Día",
        "coords": [
          -71.977381,
          -36.849091
        ]
      },
      {
        "id": "ARR-N9-024",
        "type": "arranque",
        "name": "Ana Rivas Garrido",
        "meter": "MED-N9-2024",
        "rut": "13.266.574-5",
        "status": "Al Día",
        "coords": [
          -71.978476,
          -36.849087
        ]
      },
      {
        "id": "ARR-N9-025",
        "type": "arranque",
        "name": "Cecilia Navarrete Muñoz",
        "meter": "MED-N9-2025",
        "rut": "17.223.994-3",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.977817,
          -36.849083
        ]
      },
      {
        "id": "ARR-N9-026",
        "type": "arranque",
        "name": "Gladys González Espinoza",
        "meter": "MED-N9-2026",
        "rut": "89.588.99-5",
        "status": "Al Día",
        "coords": [
          -71.976831,
          -36.849076
        ]
      },
      {
        "id": "ARR-N9-027",
        "type": "arranque",
        "name": "María Salazar Orellana",
        "meter": "MED-N9-2027",
        "rut": "92.673.73-1",
        "status": "Al Día",
        "coords": [
          -71.974445,
          -36.84907
        ]
      },
      {
        "id": "ARR-N9-028",
        "type": "arranque",
        "name": "Francisco Pino Parra",
        "meter": "MED-N9-2028",
        "rut": "16.656.638-K",
        "status": "Al Día",
        "coords": [
          -71.977164,
          -36.849064
        ]
      },
      {
        "id": "ARR-N9-029",
        "type": "arranque",
        "name": "Roberto Navarrete Carrasco",
        "meter": "MED-N9-2029",
        "rut": "16.225.003-5",
        "status": "Al Día",
        "coords": [
          -71.974643,
          -36.849059
        ]
      },
      {
        "id": "ARR-N9-030",
        "type": "arranque",
        "name": "Patricio Pérez Bustos",
        "meter": "MED-N9-2030",
        "rut": "17.614.659-1",
        "status": "Al Día",
        "coords": [
          -71.978964,
          -36.849055
        ]
      },
      {
        "id": "ARR-N9-031",
        "type": "arranque",
        "name": "Javiera Salgado Alarcón",
        "meter": "MED-N9-2031",
        "rut": "11.174.133-6",
        "status": "Convenio de Pago",
        "coords": [
          -71.979945,
          -36.849034
        ]
      },
      {
        "id": "ARR-N9-032",
        "type": "arranque",
        "name": "Víctor Lagos Cartes",
        "meter": "MED-N9-2032",
        "rut": "10.552.020-4",
        "status": "Al Día",
        "coords": [
          -71.978753,
          -36.849034
        ]
      },
      {
        "id": "ARR-N9-033",
        "type": "arranque",
        "name": "Alicia Cifuentes Sandoval",
        "meter": "MED-N9-2033",
        "rut": "17.932.024-K",
        "status": "Al Día",
        "coords": [
          -71.975962,
          -36.849033
        ]
      },
      {
        "id": "ARR-N9-034",
        "type": "arranque",
        "name": "Pedro Guíñez Villalobos",
        "meter": "MED-N9-2034",
        "rut": "17.563.074-0",
        "status": "Al Día",
        "coords": [
          -71.975251,
          -36.848993
        ]
      },
      {
        "id": "ARR-N9-035",
        "type": "arranque",
        "name": "Sergio Baeza Soto",
        "meter": "MED-N9-2035",
        "rut": "15.952.682-8",
        "status": "Al Día",
        "coords": [
          -71.984931,
          -36.84891
        ]
      },
      {
        "id": "ARR-N9-036",
        "type": "arranque",
        "name": "Margarita Contreras Pino",
        "meter": "MED-N9-2036",
        "rut": "19.174.441-1",
        "status": "Al Día",
        "coords": [
          -71.978052,
          -36.848902
        ]
      },
      {
        "id": "ARR-N9-037",
        "type": "arranque",
        "name": "Carolina Montecinos Araya",
        "meter": "MED-N9-2037",
        "rut": "19.089.658-7",
        "status": "Al Día",
        "coords": [
          -71.977489,
          -36.84876
        ]
      },
      {
        "id": "ARR-N9-038",
        "type": "arranque",
        "name": "Valentina Contreras Figueroa",
        "meter": "MED-N9-2038",
        "rut": "10.048.215-0",
        "status": "Al Día",
        "coords": [
          -71.976886,
          -36.848741
        ]
      },
      {
        "id": "ARR-N9-039",
        "type": "arranque",
        "name": "Paula Bustos Sanhueza",
        "meter": "MED-N9-2039",
        "rut": "10.736.529-K",
        "status": "Al Día",
        "coords": [
          -71.980848,
          -36.848724
        ]
      },
      {
        "id": "ARR-N9-040",
        "type": "arranque",
        "name": "Isabel Sandoval Villalobos",
        "meter": "MED-N9-2040",
        "rut": "18.248.314-1",
        "status": "Al Día",
        "coords": [
          -71.979093,
          -36.848718
        ]
      },
      {
        "id": "ARR-N9-041",
        "type": "arranque",
        "name": "Marco Guíñez Martínez",
        "meter": "MED-N9-2041",
        "rut": "17.512.444-6",
        "status": "Al Día",
        "coords": [
          -71.980179,
          -36.848718
        ]
      },
      {
        "id": "ARR-N9-042",
        "type": "arranque",
        "name": "Patricio Montecinos Reyes",
        "meter": "MED-N9-2042",
        "rut": "92.970.06-K",
        "status": "Al Día",
        "coords": [
          -71.980492,
          -36.848717
        ]
      },
      {
        "id": "ARR-N9-043",
        "type": "arranque",
        "name": "Cecilia Barrientos Sandoval",
        "meter": "MED-N9-2043",
        "rut": "16.499.489-9",
        "status": "Al Día",
        "coords": [
          -71.980007,
          -36.848717
        ]
      },
      {
        "id": "ARR-N9-044",
        "type": "arranque",
        "name": "Sofía Muñoz Troncoso",
        "meter": "MED-N9-2044",
        "rut": "16.198.196-6",
        "status": "Al Día",
        "coords": [
          -71.973824,
          -36.848712
        ]
      },
      {
        "id": "ARR-N9-045",
        "type": "arranque",
        "name": "Margarita Rivas Fuentes",
        "meter": "MED-N9-2045",
        "rut": "13.910.727-6",
        "status": "Al Día",
        "coords": [
          -71.979761,
          -36.84871
        ]
      },
      {
        "id": "ARR-N9-046",
        "type": "arranque",
        "name": "Marcela González Castillo",
        "meter": "MED-N9-2046",
        "rut": "15.079.413-7",
        "status": "Al Día",
        "coords": [
          -71.977232,
          -36.848705
        ]
      },
      {
        "id": "ARR-N9-047",
        "type": "arranque",
        "name": "Sebastián Sanhueza Lagos",
        "meter": "MED-N9-2047",
        "rut": "10.719.438-K",
        "status": "Al Día",
        "coords": [
          -71.979232,
          -36.848701
        ]
      },
      {
        "id": "ARR-N9-048",
        "type": "arranque",
        "name": "Paulina Figueroa Ortiz",
        "meter": "MED-N9-2048",
        "rut": "17.026.388-K",
        "status": "Al Día",
        "coords": [
          -71.980319,
          -36.848701
        ]
      },
      {
        "id": "ARR-N9-049",
        "type": "arranque",
        "name": "María Villalobos Carrasco",
        "meter": "MED-N9-2049",
        "rut": "11.015.592-1",
        "status": "Al Día",
        "coords": [
          -71.977843,
          -36.8487
        ]
      },
      {
        "id": "ARR-N9-050",
        "type": "arranque",
        "name": "Ramón Espinoza Sepúlveda",
        "meter": "MED-N9-2050",
        "rut": "11.862.288-K",
        "status": "Al Día",
        "coords": [
          -71.978945,
          -36.848699
        ]
      },
      {
        "id": "ARR-N9-051",
        "type": "arranque",
        "name": "Natalia Ortiz Silva",
        "meter": "MED-N9-2051",
        "rut": "18.792.198-8",
        "status": "Al Día",
        "coords": [
          -71.979599,
          -36.848696
        ]
      },
      {
        "id": "ARR-N9-052",
        "type": "arranque",
        "name": "María Soto Contreras",
        "meter": "MED-N9-2052",
        "rut": "10.168.220-K",
        "status": "Al Día",
        "coords": [
          -71.979074,
          -36.848689
        ]
      },
      {
        "id": "ARR-N9-053",
        "type": "arranque",
        "name": "Guillermo Beltrán Silva",
        "meter": "MED-N9-2053",
        "rut": "12.039.842-3",
        "status": "Al Día",
        "coords": [
          -71.978686,
          -36.848678
        ]
      },
      {
        "id": "ARR-N9-054",
        "type": "arranque",
        "name": "Jaime Poblete Rojas",
        "meter": "MED-N9-2054",
        "rut": "10.838.247-3",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.978817,
          -36.848672
        ]
      },
      {
        "id": "ARR-N9-055",
        "type": "arranque",
        "name": "Fernando Saavedra Guíñez",
        "meter": "MED-N9-2055",
        "rut": "17.168.476-5",
        "status": "Al Día",
        "coords": [
          -71.980717,
          -36.848672
        ]
      },
      {
        "id": "ARR-N9-056",
        "type": "arranque",
        "name": "Ana Morales Manríquez",
        "meter": "MED-N9-2056",
        "rut": "14.554.105-0",
        "status": "Al Día",
        "coords": [
          -71.978153,
          -36.848664
        ]
      },
      {
        "id": "ARR-N9-057",
        "type": "arranque",
        "name": "Carmen Rivas Contreras",
        "meter": "MED-N9-2057",
        "rut": "16.427.577-9",
        "status": "Al Día",
        "coords": [
          -71.975853,
          -36.848664
        ]
      },
      {
        "id": "ARR-N9-058",
        "type": "arranque",
        "name": "Eduardo Inostroza Montecinos",
        "meter": "MED-N9-2058",
        "rut": "12.797.934-0",
        "status": "Al Día",
        "coords": [
          -71.980822,
          -36.848646
        ]
      },
      {
        "id": "ARR-N9-059",
        "type": "arranque",
        "name": "Hugo Martínez Beltrán",
        "meter": "MED-N9-2059",
        "rut": "85.383.26-4",
        "status": "Al Día",
        "coords": [
          -71.974501,
          -36.848607
        ]
      },
      {
        "id": "ARR-N9-060",
        "type": "arranque",
        "name": "Cristián Salgado Acuña",
        "meter": "MED-N9-2060",
        "rut": "11.349.609-6",
        "status": "Al Día",
        "coords": [
          -71.978077,
          -36.848577
        ]
      },
      {
        "id": "ARR-N9-061",
        "type": "arranque",
        "name": "Cristián Bravo Henríquez",
        "meter": "MED-N9-2061",
        "rut": "92.623.60-2",
        "status": "Al Día",
        "coords": [
          -71.981601,
          -36.848515
        ]
      },
      {
        "id": "ARR-N9-062",
        "type": "arranque",
        "name": "Esteban Cartes Villalobos",
        "meter": "MED-N9-2062",
        "rut": "11.458.153-4",
        "status": "Al Día",
        "coords": [
          -71.981896,
          -36.848489
        ]
      },
      {
        "id": "ARR-N9-063",
        "type": "arranque",
        "name": "Elizabeth Lagos Sanhueza",
        "meter": "MED-N9-2063",
        "rut": "18.379.724-7",
        "status": "Al Día",
        "coords": [
          -71.978497,
          -36.848404
        ]
      },
      {
        "id": "ARR-N9-064",
        "type": "arranque",
        "name": "Ximena Reyes Orellana",
        "meter": "MED-N9-2064",
        "rut": "15.520.708-6",
        "status": "Al Día",
        "coords": [
          -71.978224,
          -36.848402
        ]
      },
      {
        "id": "ARR-N9-065",
        "type": "arranque",
        "name": "Gabriel Guíñez Vera",
        "meter": "MED-N9-2065",
        "rut": "12.170.852-3",
        "status": "Al Día",
        "coords": [
          -71.982536,
          -36.848396
        ]
      },
      {
        "id": "ARR-N9-066",
        "type": "arranque",
        "name": "Alejandro San Martín Morales",
        "meter": "MED-N9-2066",
        "rut": "11.442.110-3",
        "status": "Al Día",
        "coords": [
          -71.973295,
          -36.848394
        ]
      },
      {
        "id": "ARR-N9-067",
        "type": "arranque",
        "name": "Francisco Contreras Parra",
        "meter": "MED-N9-2067",
        "rut": "17.444.232-0",
        "status": "Al Día",
        "coords": [
          -71.984511,
          -36.84838
        ]
      },
      {
        "id": "ARR-N9-068",
        "type": "arranque",
        "name": "Juana Salgado Valenzuela",
        "meter": "MED-N9-2068",
        "rut": "89.205.08-5",
        "status": "Al Día",
        "coords": [
          -71.977968,
          -36.84837
        ]
      },
      {
        "id": "ARR-N9-069",
        "type": "arranque",
        "name": "Fernando Orellana Baeza",
        "meter": "MED-N9-2069",
        "rut": "16.377.920-K",
        "status": "Al Día",
        "coords": [
          -71.985041,
          -36.848338
        ]
      },
      {
        "id": "ARR-N9-070",
        "type": "arranque",
        "name": "Cecilia Vallejos Henríquez",
        "meter": "MED-N9-2070",
        "rut": "15.757.325-K",
        "status": "Al Día",
        "coords": [
          -71.980417,
          -36.848321
        ]
      },
      {
        "id": "ARR-N9-071",
        "type": "arranque",
        "name": "Hernán Beltrán Salazar",
        "meter": "MED-N9-2071",
        "rut": "14.673.296-8",
        "status": "Al Día",
        "coords": [
          -71.97821,
          -36.848307
        ]
      },
      {
        "id": "ARR-N9-072",
        "type": "arranque",
        "name": "Elena Palma Baeza",
        "meter": "MED-N9-2072",
        "rut": "17.858.427-8",
        "status": "Al Día",
        "coords": [
          -71.978775,
          -36.848278
        ]
      },
      {
        "id": "ARR-N9-073",
        "type": "arranque",
        "name": "Hernán Rivas Pérez",
        "meter": "MED-N9-2073",
        "rut": "12.418.068-6",
        "status": "Al Día",
        "coords": [
          -71.985456,
          -36.848236
        ]
      },
      {
        "id": "ARR-N9-074",
        "type": "arranque",
        "name": "Alicia Bravo Guíñez",
        "meter": "MED-N9-2074",
        "rut": "14.056.602-0",
        "status": "Al Día",
        "coords": [
          -71.984075,
          -36.848226
        ]
      },
      {
        "id": "ARR-N9-075",
        "type": "arranque",
        "name": "Rodrigo Espinoza Orellana",
        "meter": "MED-N9-2075",
        "rut": "86.950.77-4",
        "status": "Al Día",
        "coords": [
          -71.98331,
          -36.848217
        ]
      },
      {
        "id": "ARR-N9-076",
        "type": "arranque",
        "name": "Francisca Orellana Reyes",
        "meter": "MED-N9-2076",
        "rut": "10.705.464-2",
        "status": "Al Día",
        "coords": [
          -71.985194,
          -36.848216
        ]
      },
      {
        "id": "ARR-N9-077",
        "type": "arranque",
        "name": "Paula Orellana González",
        "meter": "MED-N9-2077",
        "rut": "13.838.906-5",
        "status": "Al Día",
        "coords": [
          -71.984193,
          -36.848204
        ]
      },
      {
        "id": "ARR-N9-078",
        "type": "arranque",
        "name": "Rosa Reyes Valenzuela",
        "meter": "MED-N9-2078",
        "rut": "11.511.112-4",
        "status": "Al Día",
        "coords": [
          -71.978129,
          -36.848204
        ]
      },
      {
        "id": "ARR-N9-079",
        "type": "arranque",
        "name": "Juana Silva Acuña",
        "meter": "MED-N9-2079",
        "rut": "13.871.518-3",
        "status": "Al Día",
        "coords": [
          -71.983654,
          -36.848172
        ]
      },
      {
        "id": "ARR-N9-080",
        "type": "arranque",
        "name": "Natalia Castillo Beltrán",
        "meter": "MED-N9-2080",
        "rut": "11.553.539-0",
        "status": "Al Día",
        "coords": [
          -71.98567,
          -36.848121
        ]
      },
      {
        "id": "ARR-N9-081",
        "type": "arranque",
        "name": "Alicia Barrientos Poblete",
        "meter": "MED-N9-2081",
        "rut": "18.136.453-K",
        "status": "Al Día",
        "coords": [
          -71.986345,
          -36.848072
        ]
      },
      {
        "id": "ARR-N9-082",
        "type": "arranque",
        "name": "Cecilia Navarrete Carrasco",
        "meter": "MED-N9-2082",
        "rut": "89.111.25-0",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.848059
        ]
      },
      {
        "id": "ARR-N9-083",
        "type": "arranque",
        "name": "Nelson Cifuentes Rojas",
        "meter": "MED-N9-2083",
        "rut": "10.901.839-2",
        "status": "Al Día",
        "coords": [
          -71.985877,
          -36.848041
        ]
      },
      {
        "id": "ARR-N9-084",
        "type": "arranque",
        "name": "Elizabeth Guíñez Palma",
        "meter": "MED-N9-2084",
        "rut": "11.523.711-K",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.986119,
          -36.848013
        ]
      },
      {
        "id": "ARR-N9-085",
        "type": "arranque",
        "name": "Andrés Manríquez Venegas",
        "meter": "MED-N9-2085",
        "rut": "85.396.77-3",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.984475,
          -36.847992
        ]
      },
      {
        "id": "ARR-N9-086",
        "type": "arranque",
        "name": "Jorge Poblete Mardones",
        "meter": "MED-N9-2086",
        "rut": "16.326.546-K",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.97846,
          -36.847991
        ]
      },
      {
        "id": "ARR-N9-087",
        "type": "arranque",
        "name": "Rosa González Carrasco",
        "meter": "MED-N9-2087",
        "rut": "11.160.102-K",
        "status": "Al Día",
        "coords": [
          -71.984774,
          -36.847989
        ]
      },
      {
        "id": "ARR-N9-088",
        "type": "arranque",
        "name": "Carmen Betancur Palma",
        "meter": "MED-N9-2088",
        "rut": "17.026.228-K",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.847968
        ]
      },
      {
        "id": "ARR-N9-089",
        "type": "arranque",
        "name": "Patricio Palma San Martín",
        "meter": "MED-N9-2089",
        "rut": "17.832.062-9",
        "status": "Al Día",
        "coords": [
          -71.985326,
          -36.84793
        ]
      },
      {
        "id": "ARR-N9-090",
        "type": "arranque",
        "name": "Juana Manríquez Betancur",
        "meter": "MED-N9-2090",
        "rut": "12.231.209-7",
        "status": "Al Día",
        "coords": [
          -71.98504,
          -36.847927
        ]
      },
      {
        "id": "ARR-N9-091",
        "type": "arranque",
        "name": "Verónica Araya Cartes",
        "meter": "MED-N9-2091",
        "rut": "85.060.64-3",
        "status": "Al Día",
        "coords": [
          -71.985562,
          -36.847849
        ]
      },
      {
        "id": "ARR-N9-092",
        "type": "arranque",
        "name": "Patricia Godoy Poblete",
        "meter": "MED-N9-2092",
        "rut": "12.575.988-2",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.985796,
          -36.847847
        ]
      },
      {
        "id": "ARR-N9-093",
        "type": "arranque",
        "name": "Alicia Venegas Rojas",
        "meter": "MED-N9-2093",
        "rut": "91.157.17-9",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.847835
        ]
      },
      {
        "id": "ARR-N9-094",
        "type": "arranque",
        "name": "Rosa Alarcón Bustos",
        "meter": "MED-N9-2094",
        "rut": "15.642.482-K",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.98705,
          -36.84781
        ]
      },
      {
        "id": "ARR-N9-095",
        "type": "arranque",
        "name": "Guillermo Ortiz Beltrán",
        "meter": "MED-N9-2095",
        "rut": "13.564.720-9",
        "status": "Al Día",
        "coords": [
          -71.987224,
          -36.847783
        ]
      },
      {
        "id": "ARR-N9-096",
        "type": "arranque",
        "name": "Carmen Rivas Bravo",
        "meter": "MED-N9-2096",
        "rut": "14.705.903-5",
        "status": "Al Día",
        "coords": [
          -71.987879,
          -36.847741
        ]
      },
      {
        "id": "ARR-N9-097",
        "type": "arranque",
        "name": "Isabel Barrientos Inostroza",
        "meter": "MED-N9-2097",
        "rut": "16.803.196-3",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.987481,
          -36.84773
        ]
      },
      {
        "id": "ARR-N9-098",
        "type": "arranque",
        "name": "Nelson Bravo Vallejos",
        "meter": "MED-N9-2098",
        "rut": "11.582.335-3",
        "status": "Al Día",
        "coords": [
          -71.978199,
          -36.847661
        ]
      },
      {
        "id": "ARR-N9-099",
        "type": "arranque",
        "name": "María Reyes Contreras",
        "meter": "MED-N9-2099",
        "rut": "16.614.295-4",
        "status": "Al Día",
        "coords": [
          -71.987726,
          -36.84764
        ]
      },
      {
        "id": "ARR-N9-100",
        "type": "arranque",
        "name": "José Cartes Muñoz",
        "meter": "MED-N9-2100",
        "rut": "19.404.403-8",
        "status": "Al Día",
        "coords": [
          -71.978207,
          -36.847574
        ]
      },
      {
        "id": "ARR-N9-101",
        "type": "arranque",
        "name": "Andrea Inostroza Beltrán",
        "meter": "MED-N9-2101",
        "rut": "10.039.447-2",
        "status": "Al Día",
        "coords": [
          -71.986353,
          -36.847489
        ]
      },
      {
        "id": "ARR-N9-102",
        "type": "arranque",
        "name": "Mónica Sepúlveda Saavedra",
        "meter": "MED-N9-2102",
        "rut": "10.320.058-K",
        "status": "Al Día",
        "coords": [
          -71.978219,
          -36.847412
        ]
      },
      {
        "id": "ARR-N9-103",
        "type": "arranque",
        "name": "Guillermo Soto Guíñez",
        "meter": "MED-N9-2103",
        "rut": "18.670.910-1",
        "status": "Al Día",
        "coords": [
          -71.990805,
          -36.847233
        ]
      },
      {
        "id": "ARR-N9-104",
        "type": "arranque",
        "name": "Fernando Cifuentes Espinoza",
        "meter": "MED-N9-2104",
        "rut": "14.860.983-7",
        "status": "Al Día",
        "coords": [
          -71.987084,
          -36.847219
        ]
      },
      {
        "id": "ARR-N9-105",
        "type": "arranque",
        "name": "Rodrigo Fuentes Muñoz",
        "meter": "MED-N9-2105",
        "rut": "11.826.227-1",
        "status": "Al Día",
        "coords": [
          -71.99114,
          -36.847111
        ]
      },
      {
        "id": "ARR-N9-106",
        "type": "arranque",
        "name": "José Orellana Reyes",
        "meter": "MED-N9-2106",
        "rut": "17.116.209-2",
        "status": "Al Día",
        "coords": [
          -71.977936,
          -36.847046
        ]
      },
      {
        "id": "ARR-N9-107",
        "type": "arranque",
        "name": "Elizabeth Troncoso Martínez",
        "meter": "MED-N9-2107",
        "rut": "10.219.290-7",
        "status": "Al Día",
        "coords": [
          -71.978149,
          -36.846987
        ]
      },
      {
        "id": "ARR-N9-108",
        "type": "arranque",
        "name": "Natalia Beltrán Troncoso",
        "meter": "MED-N9-2108",
        "rut": "85.600.19-2",
        "status": "Al Día",
        "coords": [
          -71.986111,
          -36.846953
        ]
      },
      {
        "id": "ARR-N9-109",
        "type": "arranque",
        "name": "Claudio Baeza Lagos",
        "meter": "MED-N9-2109",
        "rut": "12.971.458-1",
        "status": "Al Día",
        "coords": [
          -71.991678,
          -36.84687
        ]
      },
      {
        "id": "ARR-N9-110",
        "type": "arranque",
        "name": "Manuel Pérez Rebolledo",
        "meter": "MED-N9-2110",
        "rut": "13.338.552-5",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.978158,
          -36.846854
        ]
      },
      {
        "id": "ARR-N9-111",
        "type": "arranque",
        "name": "Mauricio Navarrete Silva",
        "meter": "MED-N9-2111",
        "rut": "15.103.497-7",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.846773
        ]
      },
      {
        "id": "ARR-N9-112",
        "type": "arranque",
        "name": "Felipe Sepúlveda Flores",
        "meter": "MED-N9-2112",
        "rut": "10.082.476-0",
        "status": "Al Día",
        "coords": [
          -71.992245,
          -36.846694
        ]
      },
      {
        "id": "ARR-N9-113",
        "type": "arranque",
        "name": "Nelson Vera Palma",
        "meter": "MED-N9-2113",
        "rut": "11.605.135-4",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.846671
        ]
      },
      {
        "id": "ARR-N9-114",
        "type": "arranque",
        "name": "Mario Venegas Vera",
        "meter": "MED-N9-2114",
        "rut": "12.908.850-8",
        "status": "Al Día",
        "coords": [
          -71.977884,
          -36.846656
        ]
      },
      {
        "id": "ARR-N9-115",
        "type": "arranque",
        "name": "Isabel Cartes Orellana",
        "meter": "MED-N9-2115",
        "rut": "18.327.736-7",
        "status": "Al Día",
        "coords": [
          -71.978135,
          -36.846537
        ]
      },
      {
        "id": "ARR-N9-116",
        "type": "arranque",
        "name": "Valeria Villalobos Sandoval",
        "meter": "MED-N9-2116",
        "rut": "15.508.450-2",
        "status": "Al Día",
        "coords": [
          -71.978086,
          -36.846403
        ]
      },
      {
        "id": "ARR-N9-117",
        "type": "arranque",
        "name": "Hugo Cartes Silva",
        "meter": "MED-N9-2117",
        "rut": "17.124.007-7",
        "status": "Al Día",
        "coords": [
          -71.993097,
          -36.846368
        ]
      },
      {
        "id": "ARR-N9-118",
        "type": "arranque",
        "name": "César Valenzuela Pérez",
        "meter": "MED-N9-2118",
        "rut": "12.836.351-3",
        "status": "Al Día",
        "coords": [
          -71.992192,
          -36.846309
        ]
      },
      {
        "id": "ARR-N9-119",
        "type": "arranque",
        "name": "Felipe Rivas Araya",
        "meter": "MED-N9-2119",
        "rut": "18.425.999-0",
        "status": "Al Día",
        "coords": [
          -71.978118,
          -36.846242
        ]
      },
      {
        "id": "ARR-N9-120",
        "type": "arranque",
        "name": "Nelson Bravo Bustos",
        "meter": "MED-N9-2120",
        "rut": "10.892.454-3",
        "status": "Al Día",
        "coords": [
          -71.977896,
          -36.846157
        ]
      },
      {
        "id": "ARR-N9-121",
        "type": "arranque",
        "name": "Héctor Navarrete Saavedra",
        "meter": "MED-N9-2121",
        "rut": "89.561.01-9",
        "status": "Al Día",
        "coords": [
          -71.978123,
          -36.846143
        ]
      },
      {
        "id": "ARR-N9-122",
        "type": "arranque",
        "name": "Sebastián Godoy Vera",
        "meter": "MED-N9-2122",
        "rut": "17.489.919-3",
        "status": "Al Día",
        "coords": [
          -71.978131,
          -36.846023
        ]
      },
      {
        "id": "ARR-N9-123",
        "type": "arranque",
        "name": "Mario Manríquez Castillo",
        "meter": "MED-N9-2123",
        "rut": "97.480.21-4",
        "status": "Al Día",
        "coords": [
          -71.998227,
          -36.845556
        ]
      },
      {
        "id": "ARR-N9-124",
        "type": "arranque",
        "name": "Manuel Valenzuela Garrido",
        "meter": "MED-N9-2124",
        "rut": "17.132.842-K",
        "status": "Al Día",
        "coords": [
          -71.99372,
          -36.845514
        ]
      },
      {
        "id": "ARR-N9-125",
        "type": "arranque",
        "name": "Juan Valenzuela Beltrán",
        "meter": "MED-N9-2125",
        "rut": "13.459.805-0",
        "status": "Al Día",
        "coords": [
          -71.998183,
          -36.845365
        ]
      },
      {
        "id": "ARR-N9-126",
        "type": "arranque",
        "name": "Paulina Rivas Morales",
        "meter": "MED-N9-2126",
        "rut": "99.489.97-9",
        "status": "Al Día",
        "coords": [
          -71.996005,
          -36.845332
        ]
      },
      {
        "id": "ARR-N9-127",
        "type": "arranque",
        "name": "Francisco Muñoz Beltrán",
        "meter": "MED-N9-2127",
        "rut": "12.714.396-K",
        "status": "Al Día",
        "coords": [
          -71.996564,
          -36.84524
        ]
      },
      {
        "id": "ARR-N9-128",
        "type": "arranque",
        "name": "Mónica Rivas Rojas",
        "meter": "MED-N9-2128",
        "rut": "92.209.43-1",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.999049,
          -36.845032
        ]
      },
      {
        "id": "ARR-N9-129",
        "type": "arranque",
        "name": "Alejandro Figueroa Guíñez",
        "meter": "MED-N9-2129",
        "rut": "12.974.872-9",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.997254,
          -36.844985
        ]
      },
      {
        "id": "ARR-N9-130",
        "type": "arranque",
        "name": "Cecilia Cifuentes Inostroza",
        "meter": "MED-N9-2130",
        "rut": "96.366.43-4",
        "status": "Al Día",
        "coords": [
          -71.997427,
          -36.844912
        ]
      },
      {
        "id": "ARR-N9-131",
        "type": "arranque",
        "name": "Lorena Cartes Villalobos",
        "meter": "MED-N9-2131",
        "rut": "11.100.651-2",
        "status": "Al Día",
        "coords": [
          -71.997743,
          -36.844696
        ]
      },
      {
        "id": "ARR-N9-132",
        "type": "arranque",
        "name": "Eduardo Flores Lagos",
        "meter": "MED-N9-2132",
        "rut": "10.437.269-4",
        "status": "Al Día",
        "coords": [
          -71.998937,
          -36.84465
        ]
      },
      {
        "id": "ARR-N9-133",
        "type": "arranque",
        "name": "Pilar Palma Villalobos",
        "meter": "MED-N9-2133",
        "rut": "94.034.38-8",
        "status": "Al Día",
        "coords": [
          -71.999436,
          -36.844559
        ]
      },
      {
        "id": "ARR-N9-134",
        "type": "arranque",
        "name": "Sebastián Lagos Salazar",
        "meter": "MED-N9-2134",
        "rut": "10.928.981-7",
        "status": "Convenio de Pago",
        "coords": [
          -71.999242,
          -36.844075
        ]
      },
      {
        "id": "ARR-N9-135",
        "type": "arranque",
        "name": "Javiera Guíñez Flores",
        "meter": "MED-N9-2135",
        "rut": "15.695.988-K",
        "status": "Al Día",
        "coords": [
          -71.999249,
          -36.843982
        ]
      },
      {
        "id": "ARR-N9-136",
        "type": "arranque",
        "name": "Hugo Contreras Montecinos",
        "meter": "MED-N9-2136",
        "rut": "13.678.365-3",
        "status": "Al Día",
        "coords": [
          -72.000072,
          -36.843803
        ]
      },
      {
        "id": "ARR-N9-137",
        "type": "arranque",
        "name": "Fernando Baeza Orellana",
        "meter": "MED-N9-2137",
        "rut": "19.118.119-0",
        "status": "Al Día",
        "coords": [
          -72.00025,
          -36.843569
        ]
      },
      {
        "id": "ARR-N9-138",
        "type": "arranque",
        "name": "Ximena Navarrete Bustos",
        "meter": "MED-N9-2138",
        "rut": "13.268.323-9",
        "status": "Al Día",
        "coords": [
          -72.000749,
          -36.843515
        ]
      },
      {
        "id": "ARR-N9-139",
        "type": "arranque",
        "name": "Constanza Godoy Sepúlveda",
        "meter": "MED-N9-2139",
        "rut": "11.688.087-3",
        "status": "Al Día",
        "coords": [
          -71.999174,
          -36.843417
        ]
      },
      {
        "id": "ARR-N9-140",
        "type": "arranque",
        "name": "Rosa Cifuentes Flores",
        "meter": "MED-N9-2140",
        "rut": "12.039.819-9",
        "status": "Al Día",
        "coords": [
          -72.000782,
          -36.843331
        ]
      },
      {
        "id": "ARR-N9-141",
        "type": "arranque",
        "name": "Mónica Sanhueza Cartes",
        "meter": "MED-N9-2141",
        "rut": "11.383.237-1",
        "status": "Al Día",
        "coords": [
          -71.999734,
          -36.843202
        ]
      },
      {
        "id": "ARR-N9-142",
        "type": "arranque",
        "name": "Juan Orellana Baeza",
        "meter": "MED-N9-2142",
        "rut": "18.982.313-4",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.998935,
          -36.843167
        ]
      },
      {
        "id": "ARR-N9-143",
        "type": "arranque",
        "name": "Iván Sandoval Flores",
        "meter": "MED-N9-2143",
        "rut": "15.940.726-8",
        "status": "Al Día",
        "coords": [
          -71.999081,
          -36.843138
        ]
      },
      {
        "id": "ARR-N9-144",
        "type": "arranque",
        "name": "César Figueroa Cifuentes",
        "meter": "MED-N9-2144",
        "rut": "14.614.450-0",
        "status": "Al Día",
        "coords": [
          -72.000084,
          -36.84306
        ]
      },
      {
        "id": "ARR-N9-145",
        "type": "arranque",
        "name": "Ana Mardones Castillo",
        "meter": "MED-N9-2145",
        "rut": "16.363.066-4",
        "status": "Al Día",
        "coords": [
          -71.999705,
          -36.843016
        ]
      },
      {
        "id": "ARR-N9-146",
        "type": "arranque",
        "name": "Marco Castillo Flores",
        "meter": "MED-N9-2146",
        "rut": "10.967.070-7",
        "status": "Moroso (2 meses)",
        "coords": [
          -72.000222,
          -36.842964
        ]
      },
      {
        "id": "ARR-N9-147",
        "type": "arranque",
        "name": "Víctor Sanhueza Acuña",
        "meter": "MED-N9-2147",
        "rut": "17.610.038-9",
        "status": "Al Día",
        "coords": [
          -71.999665,
          -36.842953
        ]
      },
      {
        "id": "ARR-N9-148",
        "type": "arranque",
        "name": "Marco Rojas Candia",
        "meter": "MED-N9-2148",
        "rut": "18.013.412-3",
        "status": "Al Día",
        "coords": [
          -71.999619,
          -36.84287
        ]
      },
      {
        "id": "ARR-N9-149",
        "type": "arranque",
        "name": "Constanza Pino Salgado",
        "meter": "MED-N9-2149",
        "rut": "14.949.833-8",
        "status": "Al Día",
        "coords": [
          -71.999997,
          -36.842842
        ]
      },
      {
        "id": "ARR-N9-150",
        "type": "arranque",
        "name": "Andrés Cifuentes Saavedra",
        "meter": "MED-N9-2150",
        "rut": "13.701.451-3",
        "status": "Al Día",
        "coords": [
          -71.999608,
          -36.842796
        ]
      },
      {
        "id": "ARR-N9-151",
        "type": "arranque",
        "name": "Patricio Espinoza Beltrán",
        "meter": "MED-N9-2151",
        "rut": "18.344.537-5",
        "status": "Al Día",
        "coords": [
          -71.999926,
          -36.842733
        ]
      },
      {
        "id": "ARR-N9-152",
        "type": "arranque",
        "name": "Fernando Villalobos Vera",
        "meter": "MED-N9-2152",
        "rut": "12.383.185-3",
        "status": "Al Día",
        "coords": [
          -72.001304,
          -36.84261
        ]
      }
    ]
  },
  "VALV-14": {
    "valveId": "VALV-14",
    "sector": "Sector Troncal Norte (TUB-09 a TUB-16)",
    "desc_operativa": "Aislamiento del tramo norte inicial de la matriz 90 mm entre la salida de estanque y la válvula intermedia KM 0.7.",
    "tipo_corte": "Sectorización Troncal Tramo Norte",
    "recovery_time": "20 a 30 min (Llenado progresivo)",
    "pipes": [
      "TUB-09",
      "TUB-10",
      "TUB-11",
      "TUB-12",
      "TUB-13",
      "TUB-14",
      "TUB-15",
      "TUB-16"
    ],
    "pipesKm": 0.68,
    "pipesCount": 8,
    "affectedCount": 49,
    "consumers": [
      {
        "id": "ARR-N9-010",
        "type": "arranque",
        "name": "Javiera Vera Espinoza",
        "meter": "MED-N9-2010",
        "rut": "10.502.891-1",
        "status": "Al Día",
        "coords": [
          -71.976228,
          -36.849544
        ]
      },
      {
        "id": "ARR-N9-011",
        "type": "arranque",
        "name": "Patricio Rivas Martínez",
        "meter": "MED-N9-2011",
        "rut": "11.019.007-7",
        "status": "Al Día",
        "coords": [
          -71.978807,
          -36.849319
        ]
      },
      {
        "id": "ARR-N9-012",
        "type": "arranque",
        "name": "Ricardo Mardones Godoy",
        "meter": "MED-N9-2012",
        "rut": "10.108.486-8",
        "status": "Al Día",
        "coords": [
          -71.975846,
          -36.849223
        ]
      },
      {
        "id": "ARR-N9-014",
        "type": "arranque",
        "name": "Francisca Montecinos Soto",
        "meter": "MED-N9-2014",
        "rut": "15.433.196-4",
        "status": "Al Día",
        "coords": [
          -71.978733,
          -36.849188
        ]
      },
      {
        "id": "ARR-N9-016",
        "type": "arranque",
        "name": "Ramón Acuña Guíñez",
        "meter": "MED-N9-2016",
        "rut": "94.932.53-K",
        "status": "Al Día",
        "coords": [
          -71.979452,
          -36.84917
        ]
      },
      {
        "id": "ARR-N9-017",
        "type": "arranque",
        "name": "Cristián Salgado Troncoso",
        "meter": "MED-N9-2017",
        "rut": "96.400.78-0",
        "status": "Al Día",
        "coords": [
          -71.979807,
          -36.849169
        ]
      },
      {
        "id": "ARR-N9-018",
        "type": "arranque",
        "name": "Silvia Sandoval Fuentes",
        "meter": "MED-N9-2018",
        "rut": "16.035.843-2",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.974594,
          -36.84914
        ]
      },
      {
        "id": "ARR-N9-019",
        "type": "arranque",
        "name": "Pedro Figueroa Castillo",
        "meter": "MED-N9-2019",
        "rut": "10.782.876-1",
        "status": "Al Día",
        "coords": [
          -71.974796,
          -36.849136
        ]
      },
      {
        "id": "ARR-N9-020",
        "type": "arranque",
        "name": "Gabriela Rebolledo Vera",
        "meter": "MED-N9-2020",
        "rut": "15.159.619-3",
        "status": "Al Día",
        "coords": [
          -71.978689,
          -36.849122
        ]
      },
      {
        "id": "ARR-N9-021",
        "type": "arranque",
        "name": "Héctor Ortiz Fuentes",
        "meter": "MED-N9-2021",
        "rut": "14.680.819-0",
        "status": "Al Día",
        "coords": [
          -71.974101,
          -36.849107
        ]
      },
      {
        "id": "ARR-N9-022",
        "type": "arranque",
        "name": "Álvaro Figueroa Araya",
        "meter": "MED-N9-2022",
        "rut": "15.618.434-9",
        "status": "Al Día",
        "coords": [
          -71.97932,
          -36.849102
        ]
      },
      {
        "id": "ARR-N9-023",
        "type": "arranque",
        "name": "Juana Sandoval Baeza",
        "meter": "MED-N9-2023",
        "rut": "91.847.14-0",
        "status": "Al Día",
        "coords": [
          -71.977381,
          -36.849091
        ]
      },
      {
        "id": "ARR-N9-024",
        "type": "arranque",
        "name": "Ana Rivas Garrido",
        "meter": "MED-N9-2024",
        "rut": "13.266.574-5",
        "status": "Al Día",
        "coords": [
          -71.978476,
          -36.849087
        ]
      },
      {
        "id": "ARR-N9-025",
        "type": "arranque",
        "name": "Cecilia Navarrete Muñoz",
        "meter": "MED-N9-2025",
        "rut": "17.223.994-3",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.977817,
          -36.849083
        ]
      },
      {
        "id": "ARR-N9-026",
        "type": "arranque",
        "name": "Gladys González Espinoza",
        "meter": "MED-N9-2026",
        "rut": "89.588.99-5",
        "status": "Al Día",
        "coords": [
          -71.976831,
          -36.849076
        ]
      },
      {
        "id": "ARR-N9-027",
        "type": "arranque",
        "name": "María Salazar Orellana",
        "meter": "MED-N9-2027",
        "rut": "92.673.73-1",
        "status": "Al Día",
        "coords": [
          -71.974445,
          -36.84907
        ]
      },
      {
        "id": "ARR-N9-028",
        "type": "arranque",
        "name": "Francisco Pino Parra",
        "meter": "MED-N9-2028",
        "rut": "16.656.638-K",
        "status": "Al Día",
        "coords": [
          -71.977164,
          -36.849064
        ]
      },
      {
        "id": "ARR-N9-029",
        "type": "arranque",
        "name": "Roberto Navarrete Carrasco",
        "meter": "MED-N9-2029",
        "rut": "16.225.003-5",
        "status": "Al Día",
        "coords": [
          -71.974643,
          -36.849059
        ]
      },
      {
        "id": "ARR-N9-030",
        "type": "arranque",
        "name": "Patricio Pérez Bustos",
        "meter": "MED-N9-2030",
        "rut": "17.614.659-1",
        "status": "Al Día",
        "coords": [
          -71.978964,
          -36.849055
        ]
      },
      {
        "id": "ARR-N9-031",
        "type": "arranque",
        "name": "Javiera Salgado Alarcón",
        "meter": "MED-N9-2031",
        "rut": "11.174.133-6",
        "status": "Convenio de Pago",
        "coords": [
          -71.979945,
          -36.849034
        ]
      },
      {
        "id": "ARR-N9-032",
        "type": "arranque",
        "name": "Víctor Lagos Cartes",
        "meter": "MED-N9-2032",
        "rut": "10.552.020-4",
        "status": "Al Día",
        "coords": [
          -71.978753,
          -36.849034
        ]
      },
      {
        "id": "ARR-N9-033",
        "type": "arranque",
        "name": "Alicia Cifuentes Sandoval",
        "meter": "MED-N9-2033",
        "rut": "17.932.024-K",
        "status": "Al Día",
        "coords": [
          -71.975962,
          -36.849033
        ]
      },
      {
        "id": "ARR-N9-034",
        "type": "arranque",
        "name": "Pedro Guíñez Villalobos",
        "meter": "MED-N9-2034",
        "rut": "17.563.074-0",
        "status": "Al Día",
        "coords": [
          -71.975251,
          -36.848993
        ]
      },
      {
        "id": "ARR-N9-036",
        "type": "arranque",
        "name": "Margarita Contreras Pino",
        "meter": "MED-N9-2036",
        "rut": "19.174.441-1",
        "status": "Al Día",
        "coords": [
          -71.978052,
          -36.848902
        ]
      },
      {
        "id": "ARR-N9-037",
        "type": "arranque",
        "name": "Carolina Montecinos Araya",
        "meter": "MED-N9-2037",
        "rut": "19.089.658-7",
        "status": "Al Día",
        "coords": [
          -71.977489,
          -36.84876
        ]
      },
      {
        "id": "ARR-N9-038",
        "type": "arranque",
        "name": "Valentina Contreras Figueroa",
        "meter": "MED-N9-2038",
        "rut": "10.048.215-0",
        "status": "Al Día",
        "coords": [
          -71.976886,
          -36.848741
        ]
      },
      {
        "id": "ARR-N9-039",
        "type": "arranque",
        "name": "Paula Bustos Sanhueza",
        "meter": "MED-N9-2039",
        "rut": "10.736.529-K",
        "status": "Al Día",
        "coords": [
          -71.980848,
          -36.848724
        ]
      },
      {
        "id": "ARR-N9-040",
        "type": "arranque",
        "name": "Isabel Sandoval Villalobos",
        "meter": "MED-N9-2040",
        "rut": "18.248.314-1",
        "status": "Al Día",
        "coords": [
          -71.979093,
          -36.848718
        ]
      },
      {
        "id": "ARR-N9-041",
        "type": "arranque",
        "name": "Marco Guíñez Martínez",
        "meter": "MED-N9-2041",
        "rut": "17.512.444-6",
        "status": "Al Día",
        "coords": [
          -71.980179,
          -36.848718
        ]
      },
      {
        "id": "ARR-N9-042",
        "type": "arranque",
        "name": "Patricio Montecinos Reyes",
        "meter": "MED-N9-2042",
        "rut": "92.970.06-K",
        "status": "Al Día",
        "coords": [
          -71.980492,
          -36.848717
        ]
      },
      {
        "id": "ARR-N9-043",
        "type": "arranque",
        "name": "Cecilia Barrientos Sandoval",
        "meter": "MED-N9-2043",
        "rut": "16.499.489-9",
        "status": "Al Día",
        "coords": [
          -71.980007,
          -36.848717
        ]
      },
      {
        "id": "ARR-N9-044",
        "type": "arranque",
        "name": "Sofía Muñoz Troncoso",
        "meter": "MED-N9-2044",
        "rut": "16.198.196-6",
        "status": "Al Día",
        "coords": [
          -71.973824,
          -36.848712
        ]
      },
      {
        "id": "ARR-N9-045",
        "type": "arranque",
        "name": "Margarita Rivas Fuentes",
        "meter": "MED-N9-2045",
        "rut": "13.910.727-6",
        "status": "Al Día",
        "coords": [
          -71.979761,
          -36.84871
        ]
      },
      {
        "id": "ARR-N9-046",
        "type": "arranque",
        "name": "Marcela González Castillo",
        "meter": "MED-N9-2046",
        "rut": "15.079.413-7",
        "status": "Al Día",
        "coords": [
          -71.977232,
          -36.848705
        ]
      },
      {
        "id": "ARR-N9-047",
        "type": "arranque",
        "name": "Sebastián Sanhueza Lagos",
        "meter": "MED-N9-2047",
        "rut": "10.719.438-K",
        "status": "Al Día",
        "coords": [
          -71.979232,
          -36.848701
        ]
      },
      {
        "id": "ARR-N9-048",
        "type": "arranque",
        "name": "Paulina Figueroa Ortiz",
        "meter": "MED-N9-2048",
        "rut": "17.026.388-K",
        "status": "Al Día",
        "coords": [
          -71.980319,
          -36.848701
        ]
      },
      {
        "id": "ARR-N9-049",
        "type": "arranque",
        "name": "María Villalobos Carrasco",
        "meter": "MED-N9-2049",
        "rut": "11.015.592-1",
        "status": "Al Día",
        "coords": [
          -71.977843,
          -36.8487
        ]
      },
      {
        "id": "ARR-N9-050",
        "type": "arranque",
        "name": "Ramón Espinoza Sepúlveda",
        "meter": "MED-N9-2050",
        "rut": "11.862.288-K",
        "status": "Al Día",
        "coords": [
          -71.978945,
          -36.848699
        ]
      },
      {
        "id": "ARR-N9-051",
        "type": "arranque",
        "name": "Natalia Ortiz Silva",
        "meter": "MED-N9-2051",
        "rut": "18.792.198-8",
        "status": "Al Día",
        "coords": [
          -71.979599,
          -36.848696
        ]
      },
      {
        "id": "ARR-N9-052",
        "type": "arranque",
        "name": "María Soto Contreras",
        "meter": "MED-N9-2052",
        "rut": "10.168.220-K",
        "status": "Al Día",
        "coords": [
          -71.979074,
          -36.848689
        ]
      },
      {
        "id": "ARR-N9-053",
        "type": "arranque",
        "name": "Guillermo Beltrán Silva",
        "meter": "MED-N9-2053",
        "rut": "12.039.842-3",
        "status": "Al Día",
        "coords": [
          -71.978686,
          -36.848678
        ]
      },
      {
        "id": "ARR-N9-054",
        "type": "arranque",
        "name": "Jaime Poblete Rojas",
        "meter": "MED-N9-2054",
        "rut": "10.838.247-3",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.978817,
          -36.848672
        ]
      },
      {
        "id": "ARR-N9-055",
        "type": "arranque",
        "name": "Fernando Saavedra Guíñez",
        "meter": "MED-N9-2055",
        "rut": "17.168.476-5",
        "status": "Al Día",
        "coords": [
          -71.980717,
          -36.848672
        ]
      },
      {
        "id": "ARR-N9-056",
        "type": "arranque",
        "name": "Ana Morales Manríquez",
        "meter": "MED-N9-2056",
        "rut": "14.554.105-0",
        "status": "Al Día",
        "coords": [
          -71.978153,
          -36.848664
        ]
      },
      {
        "id": "ARR-N9-057",
        "type": "arranque",
        "name": "Carmen Rivas Contreras",
        "meter": "MED-N9-2057",
        "rut": "16.427.577-9",
        "status": "Al Día",
        "coords": [
          -71.975853,
          -36.848664
        ]
      },
      {
        "id": "ARR-N9-058",
        "type": "arranque",
        "name": "Eduardo Inostroza Montecinos",
        "meter": "MED-N9-2058",
        "rut": "12.797.934-0",
        "status": "Al Día",
        "coords": [
          -71.980822,
          -36.848646
        ]
      },
      {
        "id": "ARR-N9-059",
        "type": "arranque",
        "name": "Hugo Martínez Beltrán",
        "meter": "MED-N9-2059",
        "rut": "85.383.26-4",
        "status": "Al Día",
        "coords": [
          -71.974501,
          -36.848607
        ]
      },
      {
        "id": "ARR-N9-060",
        "type": "arranque",
        "name": "Cristián Salgado Acuña",
        "meter": "MED-N9-2060",
        "rut": "11.349.609-6",
        "status": "Al Día",
        "coords": [
          -71.978077,
          -36.848577
        ]
      },
      {
        "id": "ARR-N9-070",
        "type": "arranque",
        "name": "Cecilia Vallejos Henríquez",
        "meter": "MED-N9-2070",
        "rut": "15.757.325-K",
        "status": "Al Día",
        "coords": [
          -71.980417,
          -36.848321
        ]
      }
    ]
  },
  "VALV-15": {
    "valveId": "VALV-15",
    "sector": "Ramal Interconexión Poniente (TUB-02 a TUB-08)",
    "desc_operativa": "Aislamiento del ramal este que conecta hacia El Calvario. Permite reparar este ramal sin cortar la troncal principal norte.",
    "tipo_corte": "Sectorización Ramal Este",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "TUB-02",
      "TUB-03",
      "TUB-04",
      "TUB-05",
      "TUB-06",
      "TUB-07",
      "TUB-08"
    ],
    "pipesKm": 0.43,
    "pipesCount": 7,
    "affectedCount": 10,
    "consumers": [
      {
        "id": "ARR-N9-001",
        "type": "arranque",
        "name": "Oscar Pino Reyes",
        "meter": "MED-N9-2001",
        "rut": "11.212.671-6",
        "status": "Al Día",
        "coords": [
          -71.968888,
          -36.850185
        ]
      },
      {
        "id": "ARR-N9-002",
        "type": "arranque",
        "name": "Ana Garrido Barrientos",
        "meter": "MED-N9-2002",
        "rut": "10.031.660-9",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.96905,
          -36.850149
        ]
      },
      {
        "id": "ARR-N9-003",
        "type": "arranque",
        "name": "Héctor Vera Mardones",
        "meter": "MED-N9-2003",
        "rut": "14.230.433-3",
        "status": "Al Día",
        "coords": [
          -71.970935,
          -36.850017
        ]
      },
      {
        "id": "ARR-N9-004",
        "type": "arranque",
        "name": "José Muñoz Cifuentes",
        "meter": "MED-N9-2004",
        "rut": "11.248.225-3",
        "status": "Al Día",
        "coords": [
          -71.969571,
          -36.849969
        ]
      },
      {
        "id": "ARR-N9-005",
        "type": "arranque",
        "name": "Ricardo Garrido Pérez",
        "meter": "MED-N9-2005",
        "rut": "12.402.734-9",
        "status": "Al Día",
        "coords": [
          -71.970279,
          -36.8499
        ]
      },
      {
        "id": "ARR-N9-008",
        "type": "arranque",
        "name": "Gladys Valenzuela Pérez",
        "meter": "MED-N9-2008",
        "rut": "11.511.255-4",
        "status": "Al Día",
        "coords": [
          -71.970166,
          -36.849661
        ]
      },
      {
        "id": "ARR-N9-009",
        "type": "arranque",
        "name": "Carolina Ortiz Flores",
        "meter": "MED-N9-2009",
        "rut": "87.318.23-0",
        "status": "Al Día",
        "coords": [
          -71.970707,
          -36.849548
        ]
      },
      {
        "id": "ARR-N9-013",
        "type": "arranque",
        "name": "Nelson Villalobos Inostroza",
        "meter": "MED-N9-2013",
        "rut": "11.592.394-3",
        "status": "Al Día",
        "coords": [
          -71.973319,
          -36.849213
        ]
      },
      {
        "id": "ARR-N9-015",
        "type": "arranque",
        "name": "Andrés Salgado Ortiz",
        "meter": "MED-N9-2015",
        "rut": "18.083.731-0",
        "status": "Al Día",
        "coords": [
          -71.972082,
          -36.849175
        ]
      },
      {
        "id": "ARR-N9-066",
        "type": "arranque",
        "name": "Alejandro San Martín Morales",
        "meter": "MED-N9-2066",
        "rut": "11.442.110-3",
        "status": "Al Día",
        "coords": [
          -71.973295,
          -36.848394
        ]
      }
    ]
  },
  "VALV-16": {
    "valveId": "VALV-16",
    "sector": "Ramal Secundario Callejón Hijuelas (TUB-43)",
    "desc_operativa": "Corte exclusivo de la tubería 63 mm del Callejón Hijuelas. No afecta el flujo de la matriz principal.",
    "tipo_corte": "Sectorización Pasaje Hijuelas",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "TUB-43"
    ],
    "pipesKm": 0.35,
    "pipesCount": 1,
    "affectedCount": 25,
    "consumers": [
      {
        "id": "ARR-N9-063",
        "type": "arranque",
        "name": "Elizabeth Lagos Sanhueza",
        "meter": "MED-N9-2063",
        "rut": "18.379.724-7",
        "status": "Al Día",
        "coords": [
          -71.978497,
          -36.848404
        ]
      },
      {
        "id": "ARR-N9-064",
        "type": "arranque",
        "name": "Ximena Reyes Orellana",
        "meter": "MED-N9-2064",
        "rut": "15.520.708-6",
        "status": "Al Día",
        "coords": [
          -71.978224,
          -36.848402
        ]
      },
      {
        "id": "ARR-N9-068",
        "type": "arranque",
        "name": "Juana Salgado Valenzuela",
        "meter": "MED-N9-2068",
        "rut": "89.205.08-5",
        "status": "Al Día",
        "coords": [
          -71.977968,
          -36.84837
        ]
      },
      {
        "id": "ARR-N9-071",
        "type": "arranque",
        "name": "Hernán Beltrán Salazar",
        "meter": "MED-N9-2071",
        "rut": "14.673.296-8",
        "status": "Al Día",
        "coords": [
          -71.97821,
          -36.848307
        ]
      },
      {
        "id": "ARR-N9-072",
        "type": "arranque",
        "name": "Elena Palma Baeza",
        "meter": "MED-N9-2072",
        "rut": "17.858.427-8",
        "status": "Al Día",
        "coords": [
          -71.978775,
          -36.848278
        ]
      },
      {
        "id": "ARR-N9-078",
        "type": "arranque",
        "name": "Rosa Reyes Valenzuela",
        "meter": "MED-N9-2078",
        "rut": "11.511.112-4",
        "status": "Al Día",
        "coords": [
          -71.978129,
          -36.848204
        ]
      },
      {
        "id": "ARR-N9-082",
        "type": "arranque",
        "name": "Cecilia Navarrete Carrasco",
        "meter": "MED-N9-2082",
        "rut": "89.111.25-0",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.848059
        ]
      },
      {
        "id": "ARR-N9-086",
        "type": "arranque",
        "name": "Jorge Poblete Mardones",
        "meter": "MED-N9-2086",
        "rut": "16.326.546-K",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.97846,
          -36.847991
        ]
      },
      {
        "id": "ARR-N9-088",
        "type": "arranque",
        "name": "Carmen Betancur Palma",
        "meter": "MED-N9-2088",
        "rut": "17.026.228-K",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.847968
        ]
      },
      {
        "id": "ARR-N9-093",
        "type": "arranque",
        "name": "Alicia Venegas Rojas",
        "meter": "MED-N9-2093",
        "rut": "91.157.17-9",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.847835
        ]
      },
      {
        "id": "ARR-N9-098",
        "type": "arranque",
        "name": "Nelson Bravo Vallejos",
        "meter": "MED-N9-2098",
        "rut": "11.582.335-3",
        "status": "Al Día",
        "coords": [
          -71.978199,
          -36.847661
        ]
      },
      {
        "id": "ARR-N9-100",
        "type": "arranque",
        "name": "José Cartes Muñoz",
        "meter": "MED-N9-2100",
        "rut": "19.404.403-8",
        "status": "Al Día",
        "coords": [
          -71.978207,
          -36.847574
        ]
      },
      {
        "id": "ARR-N9-102",
        "type": "arranque",
        "name": "Mónica Sepúlveda Saavedra",
        "meter": "MED-N9-2102",
        "rut": "10.320.058-K",
        "status": "Al Día",
        "coords": [
          -71.978219,
          -36.847412
        ]
      },
      {
        "id": "ARR-N9-106",
        "type": "arranque",
        "name": "José Orellana Reyes",
        "meter": "MED-N9-2106",
        "rut": "17.116.209-2",
        "status": "Al Día",
        "coords": [
          -71.977936,
          -36.847046
        ]
      },
      {
        "id": "ARR-N9-107",
        "type": "arranque",
        "name": "Elizabeth Troncoso Martínez",
        "meter": "MED-N9-2107",
        "rut": "10.219.290-7",
        "status": "Al Día",
        "coords": [
          -71.978149,
          -36.846987
        ]
      },
      {
        "id": "ARR-N9-110",
        "type": "arranque",
        "name": "Manuel Pérez Rebolledo",
        "meter": "MED-N9-2110",
        "rut": "13.338.552-5",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.978158,
          -36.846854
        ]
      },
      {
        "id": "ARR-N9-111",
        "type": "arranque",
        "name": "Mauricio Navarrete Silva",
        "meter": "MED-N9-2111",
        "rut": "15.103.497-7",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.846773
        ]
      },
      {
        "id": "ARR-N9-113",
        "type": "arranque",
        "name": "Nelson Vera Palma",
        "meter": "MED-N9-2113",
        "rut": "11.605.135-4",
        "status": "Al Día",
        "coords": [
          -71.978134,
          -36.846671
        ]
      },
      {
        "id": "ARR-N9-114",
        "type": "arranque",
        "name": "Mario Venegas Vera",
        "meter": "MED-N9-2114",
        "rut": "12.908.850-8",
        "status": "Al Día",
        "coords": [
          -71.977884,
          -36.846656
        ]
      },
      {
        "id": "ARR-N9-115",
        "type": "arranque",
        "name": "Isabel Cartes Orellana",
        "meter": "MED-N9-2115",
        "rut": "18.327.736-7",
        "status": "Al Día",
        "coords": [
          -71.978135,
          -36.846537
        ]
      },
      {
        "id": "ARR-N9-116",
        "type": "arranque",
        "name": "Valeria Villalobos Sandoval",
        "meter": "MED-N9-2116",
        "rut": "15.508.450-2",
        "status": "Al Día",
        "coords": [
          -71.978086,
          -36.846403
        ]
      },
      {
        "id": "ARR-N9-119",
        "type": "arranque",
        "name": "Felipe Rivas Araya",
        "meter": "MED-N9-2119",
        "rut": "18.425.999-0",
        "status": "Al Día",
        "coords": [
          -71.978118,
          -36.846242
        ]
      },
      {
        "id": "ARR-N9-120",
        "type": "arranque",
        "name": "Nelson Bravo Bustos",
        "meter": "MED-N9-2120",
        "rut": "10.892.454-3",
        "status": "Al Día",
        "coords": [
          -71.977896,
          -36.846157
        ]
      },
      {
        "id": "ARR-N9-121",
        "type": "arranque",
        "name": "Héctor Navarrete Saavedra",
        "meter": "MED-N9-2121",
        "rut": "89.561.01-9",
        "status": "Al Día",
        "coords": [
          -71.978123,
          -36.846143
        ]
      },
      {
        "id": "ARR-N9-122",
        "type": "arranque",
        "name": "Sebastián Godoy Vera",
        "meter": "MED-N9-2122",
        "rut": "17.489.919-3",
        "status": "Al Día",
        "coords": [
          -71.978131,
          -36.846023
        ]
      }
    ]
  },
  "VALV-17": {
    "valveId": "VALV-17",
    "sector": "Sector Medio Troncal KM 0.7 (TUB-17 a TUB-23)",
    "desc_operativa": "Aislamiento del tramo central de matriz 90 mm en faja vial entre KM 0.7 y la transición a 75 mm.",
    "tipo_corte": "Sectorización Troncal Tramo Medio",
    "recovery_time": "20 a 30 min (Llenado progresivo)",
    "pipes": [
      "TUB-17",
      "TUB-18",
      "TUB-19",
      "TUB-20",
      "TUB-21",
      "TUB-22",
      "TUB-23"
    ],
    "pipesKm": 0.71,
    "pipesCount": 7,
    "affectedCount": 30,
    "consumers": [
      {
        "id": "ARR-N9-035",
        "type": "arranque",
        "name": "Sergio Baeza Soto",
        "meter": "MED-N9-2035",
        "rut": "15.952.682-8",
        "status": "Al Día",
        "coords": [
          -71.984931,
          -36.84891
        ]
      },
      {
        "id": "ARR-N9-061",
        "type": "arranque",
        "name": "Cristián Bravo Henríquez",
        "meter": "MED-N9-2061",
        "rut": "92.623.60-2",
        "status": "Al Día",
        "coords": [
          -71.981601,
          -36.848515
        ]
      },
      {
        "id": "ARR-N9-062",
        "type": "arranque",
        "name": "Esteban Cartes Villalobos",
        "meter": "MED-N9-2062",
        "rut": "11.458.153-4",
        "status": "Al Día",
        "coords": [
          -71.981896,
          -36.848489
        ]
      },
      {
        "id": "ARR-N9-065",
        "type": "arranque",
        "name": "Gabriel Guíñez Vera",
        "meter": "MED-N9-2065",
        "rut": "12.170.852-3",
        "status": "Al Día",
        "coords": [
          -71.982536,
          -36.848396
        ]
      },
      {
        "id": "ARR-N9-067",
        "type": "arranque",
        "name": "Francisco Contreras Parra",
        "meter": "MED-N9-2067",
        "rut": "17.444.232-0",
        "status": "Al Día",
        "coords": [
          -71.984511,
          -36.84838
        ]
      },
      {
        "id": "ARR-N9-069",
        "type": "arranque",
        "name": "Fernando Orellana Baeza",
        "meter": "MED-N9-2069",
        "rut": "16.377.920-K",
        "status": "Al Día",
        "coords": [
          -71.985041,
          -36.848338
        ]
      },
      {
        "id": "ARR-N9-073",
        "type": "arranque",
        "name": "Hernán Rivas Pérez",
        "meter": "MED-N9-2073",
        "rut": "12.418.068-6",
        "status": "Al Día",
        "coords": [
          -71.985456,
          -36.848236
        ]
      },
      {
        "id": "ARR-N9-074",
        "type": "arranque",
        "name": "Alicia Bravo Guíñez",
        "meter": "MED-N9-2074",
        "rut": "14.056.602-0",
        "status": "Al Día",
        "coords": [
          -71.984075,
          -36.848226
        ]
      },
      {
        "id": "ARR-N9-075",
        "type": "arranque",
        "name": "Rodrigo Espinoza Orellana",
        "meter": "MED-N9-2075",
        "rut": "86.950.77-4",
        "status": "Al Día",
        "coords": [
          -71.98331,
          -36.848217
        ]
      },
      {
        "id": "ARR-N9-076",
        "type": "arranque",
        "name": "Francisca Orellana Reyes",
        "meter": "MED-N9-2076",
        "rut": "10.705.464-2",
        "status": "Al Día",
        "coords": [
          -71.985194,
          -36.848216
        ]
      },
      {
        "id": "ARR-N9-077",
        "type": "arranque",
        "name": "Paula Orellana González",
        "meter": "MED-N9-2077",
        "rut": "13.838.906-5",
        "status": "Al Día",
        "coords": [
          -71.984193,
          -36.848204
        ]
      },
      {
        "id": "ARR-N9-079",
        "type": "arranque",
        "name": "Juana Silva Acuña",
        "meter": "MED-N9-2079",
        "rut": "13.871.518-3",
        "status": "Al Día",
        "coords": [
          -71.983654,
          -36.848172
        ]
      },
      {
        "id": "ARR-N9-080",
        "type": "arranque",
        "name": "Natalia Castillo Beltrán",
        "meter": "MED-N9-2080",
        "rut": "11.553.539-0",
        "status": "Al Día",
        "coords": [
          -71.98567,
          -36.848121
        ]
      },
      {
        "id": "ARR-N9-081",
        "type": "arranque",
        "name": "Alicia Barrientos Poblete",
        "meter": "MED-N9-2081",
        "rut": "18.136.453-K",
        "status": "Al Día",
        "coords": [
          -71.986345,
          -36.848072
        ]
      },
      {
        "id": "ARR-N9-083",
        "type": "arranque",
        "name": "Nelson Cifuentes Rojas",
        "meter": "MED-N9-2083",
        "rut": "10.901.839-2",
        "status": "Al Día",
        "coords": [
          -71.985877,
          -36.848041
        ]
      },
      {
        "id": "ARR-N9-084",
        "type": "arranque",
        "name": "Elizabeth Guíñez Palma",
        "meter": "MED-N9-2084",
        "rut": "11.523.711-K",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.986119,
          -36.848013
        ]
      },
      {
        "id": "ARR-N9-085",
        "type": "arranque",
        "name": "Andrés Manríquez Venegas",
        "meter": "MED-N9-2085",
        "rut": "85.396.77-3",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.984475,
          -36.847992
        ]
      },
      {
        "id": "ARR-N9-087",
        "type": "arranque",
        "name": "Rosa González Carrasco",
        "meter": "MED-N9-2087",
        "rut": "11.160.102-K",
        "status": "Al Día",
        "coords": [
          -71.984774,
          -36.847989
        ]
      },
      {
        "id": "ARR-N9-089",
        "type": "arranque",
        "name": "Patricio Palma San Martín",
        "meter": "MED-N9-2089",
        "rut": "17.832.062-9",
        "status": "Al Día",
        "coords": [
          -71.985326,
          -36.84793
        ]
      },
      {
        "id": "ARR-N9-090",
        "type": "arranque",
        "name": "Juana Manríquez Betancur",
        "meter": "MED-N9-2090",
        "rut": "12.231.209-7",
        "status": "Al Día",
        "coords": [
          -71.98504,
          -36.847927
        ]
      },
      {
        "id": "ARR-N9-091",
        "type": "arranque",
        "name": "Verónica Araya Cartes",
        "meter": "MED-N9-2091",
        "rut": "85.060.64-3",
        "status": "Al Día",
        "coords": [
          -71.985562,
          -36.847849
        ]
      },
      {
        "id": "ARR-N9-092",
        "type": "arranque",
        "name": "Patricia Godoy Poblete",
        "meter": "MED-N9-2092",
        "rut": "12.575.988-2",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.985796,
          -36.847847
        ]
      },
      {
        "id": "ARR-N9-094",
        "type": "arranque",
        "name": "Rosa Alarcón Bustos",
        "meter": "MED-N9-2094",
        "rut": "15.642.482-K",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.98705,
          -36.84781
        ]
      },
      {
        "id": "ARR-N9-095",
        "type": "arranque",
        "name": "Guillermo Ortiz Beltrán",
        "meter": "MED-N9-2095",
        "rut": "13.564.720-9",
        "status": "Al Día",
        "coords": [
          -71.987224,
          -36.847783
        ]
      },
      {
        "id": "ARR-N9-096",
        "type": "arranque",
        "name": "Carmen Rivas Bravo",
        "meter": "MED-N9-2096",
        "rut": "14.705.903-5",
        "status": "Al Día",
        "coords": [
          -71.987879,
          -36.847741
        ]
      },
      {
        "id": "ARR-N9-097",
        "type": "arranque",
        "name": "Isabel Barrientos Inostroza",
        "meter": "MED-N9-2097",
        "rut": "16.803.196-3",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.987481,
          -36.84773
        ]
      },
      {
        "id": "ARR-N9-099",
        "type": "arranque",
        "name": "María Reyes Contreras",
        "meter": "MED-N9-2099",
        "rut": "16.614.295-4",
        "status": "Al Día",
        "coords": [
          -71.987726,
          -36.84764
        ]
      },
      {
        "id": "ARR-N9-101",
        "type": "arranque",
        "name": "Andrea Inostroza Beltrán",
        "meter": "MED-N9-2101",
        "rut": "10.039.447-2",
        "status": "Al Día",
        "coords": [
          -71.986353,
          -36.847489
        ]
      },
      {
        "id": "ARR-N9-104",
        "type": "arranque",
        "name": "Fernando Cifuentes Espinoza",
        "meter": "MED-N9-2104",
        "rut": "14.860.983-7",
        "status": "Al Día",
        "coords": [
          -71.987084,
          -36.847219
        ]
      },
      {
        "id": "ARR-N9-108",
        "type": "arranque",
        "name": "Natalia Beltrán Troncoso",
        "meter": "MED-N9-2108",
        "rut": "85.600.19-2",
        "status": "Al Día",
        "coords": [
          -71.986111,
          -36.846953
        ]
      }
    ]
  },
  "VALV-18": {
    "valveId": "VALV-18",
    "sector": "Sector Transición 75 mm (TUB-24 a TUB-29)",
    "desc_operativa": "Aislamiento del sector de reducción de diámetro 75 mm previo al sector Los Castaños.",
    "tipo_corte": "Sectorización Tramo 75 mm",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "TUB-24",
      "TUB-25",
      "TUB-26",
      "TUB-27",
      "TUB-28",
      "TUB-29"
    ],
    "pipesKm": 0.42,
    "pipesCount": 6,
    "affectedCount": 6,
    "consumers": [
      {
        "id": "ARR-N9-103",
        "type": "arranque",
        "name": "Guillermo Soto Guíñez",
        "meter": "MED-N9-2103",
        "rut": "18.670.910-1",
        "status": "Al Día",
        "coords": [
          -71.990805,
          -36.847233
        ]
      },
      {
        "id": "ARR-N9-105",
        "type": "arranque",
        "name": "Rodrigo Fuentes Muñoz",
        "meter": "MED-N9-2105",
        "rut": "11.826.227-1",
        "status": "Al Día",
        "coords": [
          -71.99114,
          -36.847111
        ]
      },
      {
        "id": "ARR-N9-109",
        "type": "arranque",
        "name": "Claudio Baeza Lagos",
        "meter": "MED-N9-2109",
        "rut": "12.971.458-1",
        "status": "Al Día",
        "coords": [
          -71.991678,
          -36.84687
        ]
      },
      {
        "id": "ARR-N9-112",
        "type": "arranque",
        "name": "Felipe Sepúlveda Flores",
        "meter": "MED-N9-2112",
        "rut": "10.082.476-0",
        "status": "Al Día",
        "coords": [
          -71.992245,
          -36.846694
        ]
      },
      {
        "id": "ARR-N9-117",
        "type": "arranque",
        "name": "Hugo Cartes Silva",
        "meter": "MED-N9-2117",
        "rut": "17.124.007-7",
        "status": "Al Día",
        "coords": [
          -71.993097,
          -36.846368
        ]
      },
      {
        "id": "ARR-N9-118",
        "type": "arranque",
        "name": "César Valenzuela Pérez",
        "meter": "MED-N9-2118",
        "rut": "12.836.351-3",
        "status": "Al Día",
        "coords": [
          -71.992192,
          -36.846309
        ]
      }
    ]
  },
  "VALV-19": {
    "valveId": "VALV-19",
    "sector": "Sector Callejón Los Castaños (TUB-30 a TUB-35)",
    "desc_operativa": "Aislamiento del tramo secundario Los Castaños protegiendo el suministro aguas arriba.",
    "tipo_corte": "Sectorización Sector Los Castaños",
    "recovery_time": "20 a 30 min (Llenado progresivo)",
    "pipes": [
      "TUB-30",
      "TUB-31",
      "TUB-32",
      "TUB-33",
      "TUB-34",
      "TUB-35"
    ],
    "pipesKm": 0.56,
    "pipesCount": 6,
    "affectedCount": 10,
    "consumers": [
      {
        "id": "ARR-N9-123",
        "type": "arranque",
        "name": "Mario Manríquez Castillo",
        "meter": "MED-N9-2123",
        "rut": "97.480.21-4",
        "status": "Al Día",
        "coords": [
          -71.998227,
          -36.845556
        ]
      },
      {
        "id": "ARR-N9-124",
        "type": "arranque",
        "name": "Manuel Valenzuela Garrido",
        "meter": "MED-N9-2124",
        "rut": "17.132.842-K",
        "status": "Al Día",
        "coords": [
          -71.99372,
          -36.845514
        ]
      },
      {
        "id": "ARR-N9-125",
        "type": "arranque",
        "name": "Juan Valenzuela Beltrán",
        "meter": "MED-N9-2125",
        "rut": "13.459.805-0",
        "status": "Al Día",
        "coords": [
          -71.998183,
          -36.845365
        ]
      },
      {
        "id": "ARR-N9-126",
        "type": "arranque",
        "name": "Paulina Rivas Morales",
        "meter": "MED-N9-2126",
        "rut": "99.489.97-9",
        "status": "Al Día",
        "coords": [
          -71.996005,
          -36.845332
        ]
      },
      {
        "id": "ARR-N9-127",
        "type": "arranque",
        "name": "Francisco Muñoz Beltrán",
        "meter": "MED-N9-2127",
        "rut": "12.714.396-K",
        "status": "Al Día",
        "coords": [
          -71.996564,
          -36.84524
        ]
      },
      {
        "id": "ARR-N9-128",
        "type": "arranque",
        "name": "Mónica Rivas Rojas",
        "meter": "MED-N9-2128",
        "rut": "92.209.43-1",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.999049,
          -36.845032
        ]
      },
      {
        "id": "ARR-N9-129",
        "type": "arranque",
        "name": "Alejandro Figueroa Guíñez",
        "meter": "MED-N9-2129",
        "rut": "12.974.872-9",
        "status": "Moroso (2 meses)",
        "coords": [
          -71.997254,
          -36.844985
        ]
      },
      {
        "id": "ARR-N9-130",
        "type": "arranque",
        "name": "Cecilia Cifuentes Inostroza",
        "meter": "MED-N9-2130",
        "rut": "96.366.43-4",
        "status": "Al Día",
        "coords": [
          -71.997427,
          -36.844912
        ]
      },
      {
        "id": "ARR-N9-131",
        "type": "arranque",
        "name": "Lorena Cartes Villalobos",
        "meter": "MED-N9-2131",
        "rut": "11.100.651-2",
        "status": "Al Día",
        "coords": [
          -71.997743,
          -36.844696
        ]
      },
      {
        "id": "ARR-N9-132",
        "type": "arranque",
        "name": "Eduardo Flores Lagos",
        "meter": "MED-N9-2132",
        "rut": "10.437.269-4",
        "status": "Al Día",
        "coords": [
          -71.998937,
          -36.84465
        ]
      }
    ]
  },
  "VALV-20": {
    "valveId": "VALV-20",
    "sector": "Sector Terminal Red 63 mm (TUB-36 a TUB-42)",
    "desc_operativa": "Aislamiento del extremo sur terminal de la red. Solo afecta a las viviendas del cul-de-sac final.",
    "tipo_corte": "Sectorización Extremo Terminal",
    "recovery_time": "10 a 15 min (Purga rápida)",
    "pipes": [
      "TUB-36",
      "TUB-37",
      "TUB-38",
      "TUB-39",
      "TUB-40",
      "TUB-41",
      "TUB-42"
    ],
    "pipesKm": 0.35,
    "pipesCount": 7,
    "affectedCount": 20,
    "consumers": [
      {
        "id": "ARR-N9-133",
        "type": "arranque",
        "name": "Pilar Palma Villalobos",
        "meter": "MED-N9-2133",
        "rut": "94.034.38-8",
        "status": "Al Día",
        "coords": [
          -71.999436,
          -36.844559
        ]
      },
      {
        "id": "ARR-N9-134",
        "type": "arranque",
        "name": "Sebastián Lagos Salazar",
        "meter": "MED-N9-2134",
        "rut": "10.928.981-7",
        "status": "Convenio de Pago",
        "coords": [
          -71.999242,
          -36.844075
        ]
      },
      {
        "id": "ARR-N9-135",
        "type": "arranque",
        "name": "Javiera Guíñez Flores",
        "meter": "MED-N9-2135",
        "rut": "15.695.988-K",
        "status": "Al Día",
        "coords": [
          -71.999249,
          -36.843982
        ]
      },
      {
        "id": "ARR-N9-136",
        "type": "arranque",
        "name": "Hugo Contreras Montecinos",
        "meter": "MED-N9-2136",
        "rut": "13.678.365-3",
        "status": "Al Día",
        "coords": [
          -72.000072,
          -36.843803
        ]
      },
      {
        "id": "ARR-N9-137",
        "type": "arranque",
        "name": "Fernando Baeza Orellana",
        "meter": "MED-N9-2137",
        "rut": "19.118.119-0",
        "status": "Al Día",
        "coords": [
          -72.00025,
          -36.843569
        ]
      },
      {
        "id": "ARR-N9-138",
        "type": "arranque",
        "name": "Ximena Navarrete Bustos",
        "meter": "MED-N9-2138",
        "rut": "13.268.323-9",
        "status": "Al Día",
        "coords": [
          -72.000749,
          -36.843515
        ]
      },
      {
        "id": "ARR-N9-139",
        "type": "arranque",
        "name": "Constanza Godoy Sepúlveda",
        "meter": "MED-N9-2139",
        "rut": "11.688.087-3",
        "status": "Al Día",
        "coords": [
          -71.999174,
          -36.843417
        ]
      },
      {
        "id": "ARR-N9-140",
        "type": "arranque",
        "name": "Rosa Cifuentes Flores",
        "meter": "MED-N9-2140",
        "rut": "12.039.819-9",
        "status": "Al Día",
        "coords": [
          -72.000782,
          -36.843331
        ]
      },
      {
        "id": "ARR-N9-141",
        "type": "arranque",
        "name": "Mónica Sanhueza Cartes",
        "meter": "MED-N9-2141",
        "rut": "11.383.237-1",
        "status": "Al Día",
        "coords": [
          -71.999734,
          -36.843202
        ]
      },
      {
        "id": "ARR-N9-142",
        "type": "arranque",
        "name": "Juan Orellana Baeza",
        "meter": "MED-N9-2142",
        "rut": "18.982.313-4",
        "status": "Moroso (1 mes)",
        "coords": [
          -71.998935,
          -36.843167
        ]
      },
      {
        "id": "ARR-N9-143",
        "type": "arranque",
        "name": "Iván Sandoval Flores",
        "meter": "MED-N9-2143",
        "rut": "15.940.726-8",
        "status": "Al Día",
        "coords": [
          -71.999081,
          -36.843138
        ]
      },
      {
        "id": "ARR-N9-144",
        "type": "arranque",
        "name": "César Figueroa Cifuentes",
        "meter": "MED-N9-2144",
        "rut": "14.614.450-0",
        "status": "Al Día",
        "coords": [
          -72.000084,
          -36.84306
        ]
      },
      {
        "id": "ARR-N9-145",
        "type": "arranque",
        "name": "Ana Mardones Castillo",
        "meter": "MED-N9-2145",
        "rut": "16.363.066-4",
        "status": "Al Día",
        "coords": [
          -71.999705,
          -36.843016
        ]
      },
      {
        "id": "ARR-N9-146",
        "type": "arranque",
        "name": "Marco Castillo Flores",
        "meter": "MED-N9-2146",
        "rut": "10.967.070-7",
        "status": "Moroso (2 meses)",
        "coords": [
          -72.000222,
          -36.842964
        ]
      },
      {
        "id": "ARR-N9-147",
        "type": "arranque",
        "name": "Víctor Sanhueza Acuña",
        "meter": "MED-N9-2147",
        "rut": "17.610.038-9",
        "status": "Al Día",
        "coords": [
          -71.999665,
          -36.842953
        ]
      },
      {
        "id": "ARR-N9-148",
        "type": "arranque",
        "name": "Marco Rojas Candia",
        "meter": "MED-N9-2148",
        "rut": "18.013.412-3",
        "status": "Al Día",
        "coords": [
          -71.999619,
          -36.84287
        ]
      },
      {
        "id": "ARR-N9-149",
        "type": "arranque",
        "name": "Constanza Pino Salgado",
        "meter": "MED-N9-2149",
        "rut": "14.949.833-8",
        "status": "Al Día",
        "coords": [
          -71.999997,
          -36.842842
        ]
      },
      {
        "id": "ARR-N9-150",
        "type": "arranque",
        "name": "Andrés Cifuentes Saavedra",
        "meter": "MED-N9-2150",
        "rut": "13.701.451-3",
        "status": "Al Día",
        "coords": [
          -71.999608,
          -36.842796
        ]
      },
      {
        "id": "ARR-N9-151",
        "type": "arranque",
        "name": "Patricio Espinoza Beltrán",
        "meter": "MED-N9-2151",
        "rut": "18.344.537-5",
        "status": "Al Día",
        "coords": [
          -71.999926,
          -36.842733
        ]
      },
      {
        "id": "ARR-N9-152",
        "type": "arranque",
        "name": "Fernando Villalobos Vera",
        "meter": "MED-N9-2152",
        "rut": "12.383.185-3",
        "status": "Al Día",
        "coords": [
          -72.001304,
          -36.84261
        ]
      }
    ]
  }
};
