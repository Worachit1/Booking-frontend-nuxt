<template>
    <div class="container">
      <div class="header">
        <span class="icon">🏠</span>
        <h1>เพิ่มห้อง</h1>
      </div>
  
      <div class="form-section">
        <!-- รูปภาพ -->
        <div class="image-section">
          <div class="image-preview">
            <img v-if="imageUrl" :src="imageUrl" alt="preview" />
            <div v-else class="placeholder">เลือกรูป</div>
          </div>
          <input type="file" ref="fileInput" @change="onFileChange" hidden />
          <button class="upload-btn" @click="$refs.fileInput.click()">เพิ่มรูป</button>
        </div>
  
        <!-- ฟอร์มข้อมูล -->
        <div class="form-fields">
          <div class="form-group">
            <label>ชื่อห้อง</label>
            <input type="text" v-model="roomName" />
          </div>
  
          <div class="form-group">
            <label>จำนวนคนที่เข้าประชุมได้</label>
            <input type="number" v-model="capacity" />
          </div>
  
          <div class="form-group">
            <label>อาคาร</label>
            <select v-model="building">
              <option disabled value="">เลือกอาคาร</option>
              <option>อาคาร 1</option>
              <option>อาคาร 2</option>
              <option>อาคาร 3</option>
            </select>
          </div>
        </div>
      </div>
  
      <div class="form-group full">
        <label>รายละเอียดห้องประชุม</label>
        <textarea rows="4" v-model="details"></textarea>
      </div>
  
      <div class="submit-btn">
        <button @click="submit">เพิ่มห้อง</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        roomName: '',
        capacity: '',
        building: '',
        details: '',
        imageUrl: null,
      };
    },
    methods: {
      onFileChange(event) {
        const file = event.target.files[0];
        if (file) {
          this.imageUrl = URL.createObjectURL(file);
        }
      },
      submit() {
        alert(`บันทึกห้อง: ${this.roomName}`);
        // เพิ่ม logic สำหรับส่งข้อมูลได้ที่นี่
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
    margin: 40px auto;
    padding: 24px;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-family: sans-serif;
    background: white;
  }
  
  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 24px;
  }
  
  .form-section {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }
  
  .image-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 180px;
  }
  
  .image-preview {
    width: 160px;
    height: 120px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 100%;
  }
  
  .placeholder {
    color: #999;
  }
  
  .upload-btn {
    margin-top: 8px;
    padding: 6px 16px;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .upload-btn:hover {
    background-color: #1976d2;
    transition: background-color 0.3s ease;
  }
  
  .form-fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .full {
    margin-top: 20px;
  }
  
  textarea {
    resize: vertical;
  }
  
  input,
  select,
  textarea {
    padding: 8px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  
  .submit-btn {
    text-align: center;
    margin-top: 24px;
  }
  
  .submit-btn button {
    background-color: #4caf50;
    color: white;
    padding: 10px 24px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .submit-btn button:hover {
    background-color: #388e3c;
    transition: background-color 0.3s ease;
  }
  </style>