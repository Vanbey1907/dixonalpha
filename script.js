// Global değişkenler
let categories = [];
let channels = [];

// DOM elementleri
const categoryContainer = document.getElementById('categories');
const channelContainer = document.getElementById('channels');
const adminIcon = document.getElementById('adminIcon');
const adminPanel = document.getElementById('adminPanel');
const adminLogin = document.getElementById('adminLogin');
const adminContent = document.getElementById('adminContent');
const categorySelect = document.getElementById('categorySelect');
const channelName = document.getElementById('channelName');
const channelUrl = document.getElementById('channelUrl');
const addChannelBtn = document.getElementById('addChannel');
const categoryName = document.getElementById('categoryName');
const addCategoryBtn = document.getElementById('addCategory');
const channelList = document.getElementById('channelList');
const playerContainer = document.getElementById('playerContainer');
const videoPlayer = document.getElementById('videoPlayer');
const closePlayer = document.getElementById('closePlayer');

// API URL (backend deploy edildikten sonra güncellenecek)
const API_URL = 'http://localhost:3000/api';

// Sayfa yüklendiğinde çalışacak fonksiyon
window.addEventListener('load', () => {
    loadCategories();
    loadChannels();
});
// Firebase yapılandırması
const firebaseConfig = {1:210517266071:android:17c7757aa3a4e0fc34e3d2
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Firestore referansını al
const db = firebase.firestore();

// Kategorileri yükle
async function loadCategories() {
    const snapshot = await db.collection('categories').get();
    categories = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    displayCategories();
    updateCategorySelect();
}

// Kanalları yükle
async function loadChannels() {
    const snapshot = await db.collection('channels').get();
    channels = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    displayChannels();
    updateChannelList();
}

// Yeni kanal ekle
addChannelBtn.addEventListener('click', async () => {
    const name = channelName.value;
    const url = channelUrl.value;
    const category = categorySelect.value;

    if (!name || !url || !category) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }

    try {
        const docRef = await db.collection('channels').add({name, url, category});
        const newChannel = {id: docRef.id, name, url, category};
        channels.push(newChannel);
        displayChannels();
        updateChannelList();
        channelName.value = '';
        channelUrl.value = '';
    } catch (error) {
        console.error('Kanal eklenirken hata oluştu:', error);
    }
});

// Yeni kategori ekle
addCategoryBtn.addEventListener('click', async () => {
    const name = categoryName.value;

    if (!name) {
        alert('Lütfen kategori adını girin.');
        return;
    }

    try {
        const docRef = await db.collection('categories').add({name});
        const newCategory = {id: docRef.id, name};
        categories.push(newCategory);
        displayCategories();
        updateCategorySelect();
        categoryName.value = '';
    } catch (error) {
        console.error('Kategori eklenirken hata oluştu:', error);
    }
});

// Kanalı sil
async function deleteChannel(channelId) {
    try {
        await db.collection('channels').doc(channelId).delete();
        channels = channels.filter(channel => channel.id !== channelId);
        displayChannels();
        updateChannelList();
    } catch (error) {
        console.error('Kanal silinirken hata oluştu:', error);
    }
}

// Diğer fonksiyonlar aynı kalabilir

// Kategorileri yükle
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        categories = await response.json();
        displayCategories();
        updateCategorySelect();
    } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
    }
}

// Kanalları yükle
async function loadChannels() {
    try {
        const response = await fetch(`${API_URL}/channels`);
        channels = await response.json();
        displayChannels();
        updateChannelList();
    } catch (error) {
        console.error('Kanallar yüklenirken hata oluştu:', error);
    }
}

// Kategorileri göster
function displayCategories() {
    categoryContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.addEventListener('click', () => filterChannels(category._id));
        categoryContainer.appendChild(button);
    });
}

// Kanalları göster
function displayChannels(filteredChannels = channels) {
    channelContainer.innerHTML = '';
    filteredChannels.forEach(channel => {
        const button = document.createElement('button');
        button.textContent = channel.name;
        button.addEventListener('click', () => playChannel(channel.url));
        channelContainer.appendChild(button);
    });
}

// Kanalları filtrele
function filterChannels(categoryId) {
    const filteredChannels = channels.filter(channel => channel.category === categoryId);
    displayChannels(filteredChannels);
}

// Kanalı oynat
function playChannel(url) {
    videoPlayer.src = url;
    playerContainer.style.display = 'block';
}

// Oynatıcıyı kapat
closePlayer.addEventListener('click', () => {
    playerContainer.style.display = 'none';
    videoPlayer.src = '';
});

// Admin panelini aç/kapat
adminIcon.addEventListener('click', () => {
    adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
});

// Admin girişi
adminLogin.addEventListener('click', () => {
    // Gerçek uygulamada burada bir kimlik doğrulama yapılmalıdır
    adminContent.style.display = 'block';
    adminLogin.style.display = 'none';
});

// Yeni kanal ekle
addChannelBtn.addEventListener('click', async () => {
    const name = channelName.value;
    const url = channelUrl.value;
    const category = categorySelect.value;

    if (!name || !url || !category) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/channels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, url, category }),
        });
        const newChannel = await response.json();
        channels.push(newChannel);
        displayChannels();
        updateChannelList();
        channelName.value = '';
        channelUrl.value = '';
    } catch (error) {
        console.error('Kanal eklenirken hata oluştu:', error);
    }
});

// Yeni kategori ekle veya güncelle
addCategoryBtn.addEventListener('click', async () => {
    const name = categoryName.value;

    if (!name) {
        alert('Lütfen kategori adını girin.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });
        const newCategory = await response.json();
        categories.push(newCategory);
        displayCategories();
        updateCategorySelect();
        categoryName.value = '';
    } catch (error) {
        console.error('Kategori eklenirken hata oluştu:', error);
    }
});

// Kategori seçeneklerini güncelle
function updateCategorySelect() {
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Kanal listesini güncelle
function updateChannelList() {
    channelList.innerHTML = '';
    channels.forEach(channel => {
        const div = document.createElement('div');
        div.textContent = `${channel.name} (${getCategoryName(channel.category)})`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Sil';
        deleteBtn.addEventListener('click', () => deleteChannel(channel._id));
        div.appendChild(deleteBtn);
        channelList.appendChild(div);
    });
}

// Kategori adını getir
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Bilinmeyen Kategori';
}

// Kanalı sil
async function deleteChannel(channelId) {
    try {
        await fetch(`${API_URL}/channels/${channelId}`, {
            method: 'DELETE',
        });
        channels = channels.filter(channel => channel._id !== channelId);
        displayChannels();
        updateChannelList();
    } catch (error) {
        console.error('Kanal silinirken hata oluştu:', error);
    }
}irken hata oluştu:', error);
    }
}