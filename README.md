idk why 50% of the codeabse is makefile. 

# Reed-Solomon Error Correction Project

This project is a demo of the [Reed Solomon Error correction library](https://github.com/sohamjog/reed_solomon_rs) written in Rust. 

## Steps
- **Encode a file:** Split a file into multiple shares using Reed-Solomon encoding. Also get redundant shares for robustness against erasure/ corruption.
- **Get shares:** Retrieve encoded shares of the file.
- **Mess around with shares:** Modify or manipulate shares for experimentation.
- **Upload shares:** Upload the manipulated shares back for decoding.
- **Decode a file:** Recover the original file from a sufficient number of shares.

## Instructions
While the project is not hosted online, you can run it locally by following these steps:

### Clone the repository
```bash
git clone <repo-url>
cd <repo-folder>
```

### Running the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run start
   ```

The frontend should now be running on `localhost:3000`. Open this URL in your browser to access the UI.

### Running the Backend
1. Open a new terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build the backend in release mode:
   ```bash
   cargo build --release
   ```
3. Run the backend:
   ```bash
   cargo run
   ```

The backend will be running on `localhost:8000` and ready to handle requests from the frontend.

## Usage
1. Open `localhost:3000` in your browser to interact with the UI.
2. Use the UI to upload files, encode them into shares, manipulate shares, and decode them back.
3. Try playing around with the number of shares. I usually have 4 required and 4 redundant shares.

## Technology Stack
- **Frontend:** React.js
- **Backend:** Rust (Axum framework)
- **Error Correction Library:** Reed-Solomon encoding/decoding

## Future Enhancements
- Host the application online for easier access.
- Add more flexibility in share manipulation (e.g., simulating different error scenarios).
- Improve UI/UX for a smoother user experience.

---

Feel free to explore, modify, and contribute to this project!

