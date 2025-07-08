# LIBRE 🌬️

**LIBRE** es una plataforma web minimalista para soltar frases anónimas que desaparecen tras 30 días.

## Estructura

```
public/
├── index.html
├── style.css
├── firebase-config.js
├── app.js
└── README.md
```

## Configuración

1. Crea un proyecto en Firebase y habilita Cloud Firestore en modo prueba.
2. Copia tus credenciales en `firebase-config.js`.
3. Configura las reglas:

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /phrases/{docId} {
      allow read, write: if true;
    }
  }
}
```

4. Despliega con Netlify usando `public/` como carpeta.
