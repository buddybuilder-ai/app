# Furniture 3D Models Directory

This directory is for storing GLB/GLTF 3D model files for furniture items.

## How to Add a 3D Model

1. **Download a bed model** from one of these free sources:
   - [Sketchfab](https://sketchfab.com/search?q=bed&type=models&licenses=322a749bcfa841b29dff1571c1d32b72) (filter by "Free Download")
   - [Poly Pizza](https://poly.pizza/search/bed)
   - [Turbosquid](https://www.turbosquid.com/Search/3D-Models/free/bed) (filter by "Free")

2. **Place the file here** as `.glb`:
   ```
   app/public/furniture_models/.glb
   ```

3. **Add model_url** in `lib/furniture-catalog.ts`:
   ```typescript
   {
     id: "bed-queen",
     name: "Queen Bed",
     // ... other properties
     model_url: "/furniture_models/model.glb",
   }
   ```

## Model Requirements

- **Format**: GLB (recommended) or GLTF
- **Units**: Meters (match the dimensions in catalog)
- **Origin**: Center bottom of the model
- **File size**: Keep under 5MB for best performance

## Current Models

| File | Furniture | Status |
|------|-----------|--------|
| bed.glb | Queen Bed | ⏳ Pending - needs to be added |
