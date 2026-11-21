# 04 — Forms & validation

> **When to read:** When building the add/edit car form, the login form, or image upload.

## 5. Forms

### 5.1 Stack

- **React Hook Form + Zod** (`@hookform/resolvers/zod`) for every data-entry form.
- RHF owns field values, errors, and submitting state. Do not mirror them in `useState`.
- Bind inputs with RHF `Controller`, using shadcn `Field` / `Input` (§6).

### 5.2 Schema

- The car form schema lives in `features/cars/schemas/`. Its rules **mirror the API spec** (required, max length, format), so the user gets instant feedback.
- The backend is still the authority. Frontend validation is UX, not security.
- Derive form types with `z.infer`. Submit the parsed output, not raw values.
- Do not trim, lowercase, or otherwise change data unless the API spec says so. Car rules come from [ADR-0016](../../adr/0016-car-field-rules.md): trim all text, collapse whitespace in the registration number, empty notes → `null`.
- Province uses a searchable combobox over a const list of the 77 provinces (`features/cars/constants/provinces.ts`), which must match the backend list exactly. 👁️

### 5.3 Lifecycle

1. `useForm` with explicit `defaultValues`, `zodResolver(schema)`, and `mode: "onSubmit"`.
2. `<form noValidate onSubmit={handleSubmit(onValid)}>`.
3. While submitting, disable submit and block double submit.
4. On API failure, **keep the user's input**. On success, navigate or reset, and show feedback (§7).
5. The edit form loads its default values from the car query. A background refresh must not overwrite fields the user has edited.

### 5.4 Server errors on forms

- `422` with `fieldErrors` → map each known field to RHF `setError(field, ...)`. Unknown fields go into a form-level Alert.
- `409 CAR_PLATE_EXISTS` → shown as an error on the registration number field (the plate = number + province, [ADR-0016](../../adr/0016-car-field-rules.md)).
- Other errors → a form-level Alert. Never show the same error twice (inline and Alert). 👁️

### 5.5 Image upload

- Check type and size on the client before uploading, using the same limits as the backend.
- Show a preview, upload progress or pending state, and a way to remove or replace the image.
- Upload = `multipart/form-data` (`FormData`) to `POST /cars/:id/images`. Do **not** set `Content-Type` manually; the browser adds the boundary. The API client must not force JSON headers for `FormData`.
- **Create flow** ([ADR-0012](../../adr/0012-multiple-images-per-car.md)): images are picked in the create form and held locally with previews (revoke object URLs on remove/unmount). On Save: `POST /cars` → on success → `POST /cars/:id/images`.
  - Car failed → stay on the form, input and picked images kept.
  - Car saved, images failed → go to the edit page with an Alert naming how many failed and offering retry. Never delete the saved car to "roll back".
- **Edit flow** ([ADR-0012](../../adr/0012-multiple-images-per-car.md)): the images section saves immediately. Upload on pick (per-image pending state, success toast); delete after an Alert Dialog confirmation. It is a separate section from the car fields form, with the hint "Image changes are saved immediately". The car fields still use Save/Cancel.
- One shared gallery component (`features/cars/components/car-image-gallery.tsx`) serves both pages.
- Show the remaining slots (e.g. "3 / 10") and disable picking at the limit.
