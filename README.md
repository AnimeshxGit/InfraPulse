# InfraPulse — Setup & Execution Instructions

## 1. ML Model Setup

The InfraPulse ML model is implemented in the notebook:

`InfraPulse_model.ipynb`

### Steps

1. Open **Google Colab**.
2. Upload and open `InfraPulse_model.ipynb`.
3. Upload the **DESCON dataset ZIP file** (`DESCON_zip.zip`) when prompted.
4. Run **all cells in the notebook sequentially**.
5. The notebook performs dataset preparation, model training, validation, and evaluation.
6. After successful execution, the trained **MobileNetV3-Small model weights** (`.pth` file) will be generated.

The generated `.pth` file is required for the next stage.

---

## 2. ML Model Testing & Priority Leaderboard

The trained model can be tested using:

`InfraPulse_Leaderboard.ipynb`

### Steps

1. Open a new Google Colab notebook.
2. Upload and open `InfraPulse_Leaderboard.ipynb`.
3. Upload the trained **`.pth` model weights** generated from `InfraPulse_model.ipynb`.
4. Run **all cells sequentially**.
5. Upload sample infrastructure images when prompted.
6. The notebook will run the complete inference pipeline and display:

   * Detected defect category
   * Model confidence
   * Severity estimation
   * Visible extent estimation
   * Priority score
   * Issue priority ranking / leaderboard
   * Inference time

This demonstrates how the trained InfraPulse ML model processes real-world infrastructure images and prioritizes reported issues.

---

## 3. InfraPulse Website

The complete web application is provided in the folder:

`InfraPulse_website/`

This folder contains the website source code along with its own `README.md` containing the required setup and execution instructions.

### Website Setup

1. Open the `InfraPulse_website` folder.
2. Read and follow the instructions provided in its `README.md`.
3. Install the required dependencies.
4. Configure the application as specified in the website README.
5. Start the backend and frontend components as instructed.
6. Open the application in the browser.

The website provides the user-facing interface for submitting infrastructure complaints and viewing the resulting defect classification and priority information.

---

## 4. Recommended Execution Order

For the complete InfraPulse workflow, follow this order:

```text
DESCON_zip.zip
       ↓
InfraPulse_model.ipynb
       ↓
Train MobileNetV3-Small
       ↓
Generated .pth Model Weights
       ↓
InfraPulse_Leaderboard.ipynb
       ↓
Image Upload & ML Inference
       ↓
Defect + Severity + Extent + Priority
       ↓
Priority Leaderboard
       
       +
       
InfraPulse_website/
       ↓
Web Application
```

## 5. Important Notes

* **Google Colab** is recommended for running the ML notebooks.
* The DESCON dataset ZIP is required only for model training.
* The trained `.pth` file is required for running the inference/leaderboard notebook.
* Run notebook cells **in sequence** to avoid missing dependencies or variables.
* For the website, follow the separate instructions provided in `InfraPulse_website/README.md`.
