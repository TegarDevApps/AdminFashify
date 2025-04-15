import { useEffect, useState } from "react";
import { db } from "../../db/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { PencilLine, Trash } from "lucide-react";

const DashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setSelectedUser({
            ...user,
            address: user.address || "",
            image_url: user.image_url || "",
            name: user.name || "",
            phone: user.phone || ""
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (user) => {
        await deleteDoc(doc(db, "users", user.id));
        setUsers(users.filter(item => item.id !== user.id));
    };

    const updateUser = async () => {
        if (!selectedUser) return;
        const userRef = doc(db, "users", selectedUser.id);
        await updateDoc(userRef, selectedUser);
        setIsEditModalOpen(false);
        setUsers(users.map(item => item.id === selectedUser.id ? selectedUser : item));
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <div className="overflow-x-auto card text-white">
                <table className="min-w-full ">
                    <thead className="mb-5">
                        <tr>
                            <th>#</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <img src={user.image_url} className="size-14 object-cover rounded" alt={user.name} />
                                </td>
                                <td>{user.name}</td>
                                <td>{user.phone}</td>
                                <td>{user.address}</td>
                                <td>
                                    <button className="text-blue-500" onClick={() => handleEdit(user)}><PencilLine size={20} /></button>
                                    <button className="text-red-500 ml-2" onClick={() => handleDelete(user)}><Trash size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit User</h2>

                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            value={selectedUser.name}
                            onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                            className="w-full border p-2 rounded mb-2"
                        />

                        <label className="block text-sm font-medium">Phone</label>
                        <input
                            type="text"
                            value={selectedUser.phone}
                            onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                            className="w-full border p-2 rounded mb-2"
                        />

                        <label className="block text-sm font-medium">Address</label>
                        <input
                            type="text"
                            value={selectedUser.address}
                            onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                            className="w-full border p-2 rounded mb-2"
                        />

                        <label className="block text-sm font-medium">Image URL</label>
                        <input
                            type="text"
                            value={selectedUser.image_url}
                            onChange={(e) => setSelectedUser({ ...selectedUser, image_url: e.target.value })}
                            className="w-full border p-2 rounded mb-2"
                        />

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={updateUser}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="bg-gray-300 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;