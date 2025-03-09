import { useEffect, useState } from "react";
import { db } from "../../db/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Footer } from "@/layouts/footer";
import { PencilLine, Trash } from "lucide-react";

const DashboardPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleEdit = (product) => {
        setSelectedProduct({
            ...product,
            name: product.name || "", 
            category_id: product.category_id || "", 
            description: product.description || "", 
            gender: product.gender || "unisex", 
            price: product.price || 0, 
            stock: product.stock || 0, 
            color: Array.isArray(product.color) ? product.color : [""], 
            size: Array.isArray(product.size) ? product.size : [""], 
            materials: Array.isArray(product.materials) ? product.materials : [""], 
            image: Array.isArray(product.image) ? product.image : [""], 
            suitable_for_body_type: Array.isArray(product.suitable_for_body_type) ? product.suitable_for_body_type : [""],
        });
        setIsEditModalOpen(true);
    };
    
    
    

    const handleDelete = (product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const updateProduct = async () => {
        if (!selectedProduct) return;
        const productRef = doc(db, "products", selectedProduct.id);
        await updateDoc(productRef, selectedProduct);
        setIsEditModalOpen(false);
        window.location.reload();
    };

    const deleteProduct = async () => {
        if (!selectedProduct) return;
        await deleteDoc(doc(db, "products", selectedProduct.id));
        setIsDeleteModalOpen(false);
        window.location.reload();
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Products</h1>
            <div className="button mb-5 w-full">
                <Link to="/new-product" className="text-white bg-blue-500 px-3 py-3 rounded-md">Tambah Produk +</Link>
            </div>
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Products</p>
                </div>
                <div className="card-body p-0">
                    <table className="table">
                        <thead className="table-header">
                            <tr>
                                <th>#</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {product.image?.[0] && <img src={product.image[0]} className="size-14" alt={product.name} />}
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.category_id}</td>
                                    <td>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(product.price)}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <button className="text-blue-500" onClick={() => handleEdit(product)}><PencilLine size={20} /></button>
                                        <button className="text-red-500 ml-2" onClick={() => handleDelete(product)}><Trash size={20} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Edit Modal */}
            {isEditModalOpen && selectedProduct && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Product</h2>

            {/* Kategori */}
            <label className="block text-sm font-medium">Category</label>
            <input
                type="text"
                value={selectedProduct.category_id}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, category_id: e.target.value })}
                className="w-full border p-2 rounded mb-2"
            />

            {/* Nama Produk */}
            <label className="block text-sm font-medium">Name</label>
            <input
                type="text"
                value={selectedProduct.name}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                className="w-full border p-2 rounded mb-2"
            />

            {/* Deskripsi */}
            <label className="block text-sm font-medium">Description</label>
            <textarea
                value={selectedProduct.description}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                className="w-full border p-2 rounded mb-2"
            />

            {/* Gender */}
            <label className="block text-sm font-medium">Gender</label>
            <select
                value={selectedProduct.gender}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, gender: e.target.value })}
                className="w-full border p-2 rounded mb-2"
            >
                <option value="unisex">Unisex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>

            {/* Harga */}
            <label className="block text-sm font-medium">Price</label>
            <input
                type="number"
                value={selectedProduct.price}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
                className="w-full border p-2 rounded mb-2"
            />

            {/* Stok */}
            <label className="block text-sm font-medium">Stock</label>
            <input
                type="number"
                value={selectedProduct.stock}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })}
                className="w-full border p-2 rounded mb-2"
            />

            {/* Colors */}
            <label className="block text-sm font-medium">Colors</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedProduct.color.map((color, index) => (
                    <input
                        key={index}
                        type="text"
                        value={color}
                        onChange={(e) => {
                            const newColors = [...selectedProduct.color];
                            newColors[index] = e.target.value;
                            setSelectedProduct({ ...selectedProduct, color: newColors });
                        }}
                        className="border p-2 rounded w-24"
                    />
                ))}
            </div>

            {/* Ukuran */}
            <label className="block text-sm font-medium">Sizes</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedProduct.size.map((size, index) => (
                    <input
                        key={index}
                        type="text"
                        value={size}
                        onChange={(e) => {
                            const newSizes = [...selectedProduct.size];
                            newSizes[index] = e.target.value;
                            setSelectedProduct({ ...selectedProduct, size: newSizes });
                        }}
                        className="border p-2 rounded w-24"
                    />
                ))}
            </div>

            {/* Material */}
            <label className="block text-sm font-medium">Materials</label>
            <div className="flex flex-wrap gap-2 mb-2">
            {selectedProduct.materials?.map((material, index) => (
                <input
                    key={index}
                    type="text"
                    value={material}
                    onChange={(e) => {
                        const newMaterials = [...selectedProduct.materials];
                        newMaterials[index] = e.target.value;
                        setSelectedProduct({ ...selectedProduct, materials: newMaterials });
                    }}
                    className="border p-2 rounded w-24"
                />
            )) || []}

            </div>

            {/* Gambar */}
            <label className="block text-sm font-medium">Images</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedProduct.image.map((img, index) => (
                    <input
                        key={index}
                        type="text"
                        value={img}
                        onChange={(e) => {
                            const newImages = [...selectedProduct.image];
                            newImages[index] = e.target.value;
                            setSelectedProduct({ ...selectedProduct, image: newImages });
                        }}
                        className="border p-2 rounded w-32"
                    />
                ))}
            </div>

            {/* Suitable for Body Type */}
            <label className="block text-sm font-medium">Suitable for Body Type</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedProduct.suitable_for_body_type.map((type, index) => (
                    <input
                        key={index}
                        type="text"
                        value={type}
                        onChange={(e) => {
                            const newTypes = [...selectedProduct.suitable_for_body_type];
                            newTypes[index] = e.target.value;
                            setSelectedProduct({ ...selectedProduct, suitable_for_body_type: newTypes });
                        }}
                        className="border p-2 rounded w-32"
                    />
                ))}
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={updateProduct} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                <button onClick={() => setIsEditModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
        </div>
    </div>
)}


            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedProduct && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                        <p className="mb-4">Are you sure you want to delete <strong>{selectedProduct.name}</strong>?</p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={deleteProduct} className="bg-red-500 text-white px-4 py-2 rounded">Yes, Delete</button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default DashboardPage;
