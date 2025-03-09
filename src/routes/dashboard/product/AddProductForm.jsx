import { useState } from "react";
import { db } from "../../db/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X } from "lucide-react";

const AddProductForm = ({ onClose }) => {
  const [product, setProduct] = useState({
    category_id: "",
    name: "",
    description: "",
    gender: "unisex",
    price: "",
    stock: "",
    color: [],
    size: [],
    materials: [],
    tags: [],
    image: [],
    occasions: [],
    suitable_for_body_type: [],
    suitable_for_skin_tone: [],
    temperature_suitability: [],
    suitable_for_face_shape: [],
    recommended_for_style: [],
  });

  const [products, setProducts] = useState([
    {
      category_id: "",
      name: "",
      description: "",
      gender: "unisex",
      price: "",
      stock: "",
      color: [],
      size: [],
      materials: [],
      tags: [],
      image: [],
      occasions: [],
      suitable_for_body_type: [],
      suitable_for_skin_tone: [],
      temperature_suitability: [],
      suitable_for_face_shape: [],
      recommended_for_style: [],
    },
  ]);


  // Handle input JSON
  const handleJsonInputs = (e) => {
    try {
      const jsonData = JSON.parse(e.target.value);
      if (!Array.isArray(jsonData)) {
        alert("Data harus dalam format array!");
        return;
      }
      setProducts(jsonData);
    } catch (error) {
      alert("Invalid JSON format");
    }
  };

  const handleSubmits = async (e) => {
    e.preventDefault();
    try {
      const batch = products.map(async (product) =>
        addDoc(collection(db, "products"), {
          ...product,
          created_at: serverTimestamp(),
        })
      );
      await Promise.all(batch);
      alert("Semua produk berhasil ditambahkan!");
      onClose();
    } catch (error) {
      console.error("Error menambahkan produk:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProduct({
      ...product,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleArrayChange = (e, key) => {
    setProduct({
      ...product,
      [key]: e.target.value.split(",").map((item) => item.trim()),
    });
  };

  const handleJsonInput = (e) => {
    try {
      const jsonData = JSON.parse(e.target.value);
      setProduct(jsonData);
    } catch (error) {
      alert("Invalid JSON format");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          setProduct(jsonData);
        } catch (error) {
          alert("Invalid JSON file format");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        ...product,
        created_at: serverTimestamp(),
      });
      alert("Produk berhasil ditambahkan!");
      onClose();
    } catch (error) {
      console.error("Error menambahkan produk:", error);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="title">Tambah Produk</h1>

      <div className="card w-full p-6 bg-[#0f172a] rounded-lg shadow-lg text-white">
        <div className="card-header flex justify-between items-center mb-4">
          <p className="card-title text-lg font-bold">Tambah Produk</p>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            placeholder="Paste JSON data here"
            onChange={handleJsonInput}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          ></textarea>
          
          <input
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          />

          <label htmlFor=""></label>
          <input type="text" name="category_id" placeholder="Kategori" onChange={handleChange} value={product.category_id} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="name" placeholder="Nama Produk" onChange={handleChange} value={product.name} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <textarea name="description" placeholder="Deskripsi" onChange={handleChange} value={product.description} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" ></textarea>
          <input type="text" name="gender" placeholder="Gender" onChange={handleChange} value={product.gender} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="number" name="price" placeholder="Harga" onChange={handleChange} value={product.price} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="number" name="stock" placeholder="Stok" onChange={handleChange} value={product.stock} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />

          {/* Input untuk array */}
          <input type="text" name="color" placeholder="Warna (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "color")} value={product.color.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="size" placeholder="Ukuran (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "size")} value={product.size.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="materials" placeholder="Material (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "materials")} value={product.materials.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="tags" placeholder="Tags (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "tags")} value={product.tags.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="image" placeholder="Gambar URL (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "image")} value={product.image.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="occasions" placeholder="Acara Cocok Untuk (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "occasions")} value={product.occasions.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="suitable_for_body_type" placeholder="Tipe Badan (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "suitable_for_body_type")} value={product.suitable_for_body_type.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="suitable_for_skin_tone" placeholder="Tipe Kulit (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "suitable_for_skin_tone")} value={product.suitable_for_skin_tone.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="temperature_suitability" placeholder="Cocok untuk Suhu (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "temperature_suitability")} value={product.temperature_suitability.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="suitable_for_face_shape" placeholder="Bentuk Wajah (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "suitable_for_face_shape")} value={product.suitable_for_face_shape.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />
          <input type="text" name="recommended_for_style" placeholder="Rekomendasi Gaya (pisahkan dengan koma)" onChange={(e) => handleArrayChange(e, "recommended_for_style")} value={product.recommended_for_style.join(", ")} className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500" />

          <div className="flex justify-between">
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">Simpan</button>
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition">Batal</button>
          </div>
        </form>
      </div>
      <div className="flex flex-col gap-y-4">
      <h1 className="title">Tambah Produk Json Lebih Dari 1</h1>
      <div className="card w-full p-6 bg-[#0f172a] rounded-lg shadow-lg text-white">
        <div className="card-header flex justify-between items-center mb-4">
          <p className="card-title text-lg font-bold">Tambah Produk</p>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmits} className="space-y-4">
          <textarea
            placeholder="Paste JSON data here"
            onChange={handleJsonInputs}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          ></textarea>
          
          <input
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex justify-between">
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
              Simpan
            </button>
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
    
  );
};

export default AddProductForm;
