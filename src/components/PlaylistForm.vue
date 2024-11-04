<template>
    <div class="playlist-form-container">
        <Dialog v-model="showDialog" id="playlist-form-dialog" @handleClose="closeDialog">
            <template #title>
                <span v-show="!playlistId">创建歌单</span>
                <span v-show="playlistId">编辑歌单</span>
            </template>
            <template #content>
                <div class="form-warp">
                    <form @submit.prevent="submitPlaylist">
                        <div class="form-group-name">
                            <label for="playlist-name">歌单名称:</label>
                            <input type="text" id="playlist-name" v-model="formData.name" placeholder="请输入歌单名称" required>
                        </div>
                        <div class="form-group-img">
                            <label for="playlist-img">封面图片:</label>
                            <input type="file" id="playlist-img" accept="image/*">
                        </div>
                        <div class="form-group-tags">
                            <label for="playlist-tags">标签:</label>
                            <select name="tags" id="playlist-tags" @change="handleSelectTag">
                                <option value="" disabled selected>请选择</option>
                                <option v-for="(tag, index) in localTags" :key="index" :value="tag" >{{ tag }}</option>                            
                            </select>
                        </div> 
                        <ul class="form-group-show-tags">
                            <li class="tagSelected" v-for="(tag, index) in formData.tags" :key="index">
                                <span>{{ tag }}</span>
                                <i class="iconfont icon-close" @click="formData.tags.splice(index, 1)"></i>
                            </li>
                            <li class="tagSelected plus" @click="showTagDialog=true">
                                <i class="iconfont icon-plus"></i>
                            </li>
                        </ul> 
                        <Dialog v-model="showTagDialog" type="modal" id="playlist-form-tag-dialog">
                            <template #title>创建标签</template>
                            <template #content>
                                <form @submit.prevent="createTag" class="form-group-tagDiv">
                                    <label for="playlist-tagDiv">自定义标签:</label>
                                    <input type="text" id="playlist-tagDiv" placeholder="回车创建标签" required>
                                </form>
                            </template>
                        </Dialog>
                        <div class="form-group-desc">
                            <label for="playlist-desc">描述:</label>
                            <textarea id="playlist-desc" v-model="formData.description" placeholder="请输入歌单描述"></textarea>
                        </div>
                        <div class="form-group-btn">
                            <button type="submit" v-show="!playlistId">创建</button>
                            <button type="submit" v-show="playlistId">修改</button>
                            <button type="button" @click="closeDialog">取消</button>
                        </div>
                    </form>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import Dialog from './utils/Dialog.vue';
import { ref } from 'vue';
import { useLocalStore } from '../store/localStore';
import { storeToRefs } from 'pinia';
import useDeepClone from '../hooks/useDeepClone';
const localStore = useLocalStore()
const { localTags } = storeToRefs(localStore)
const deepClone = useDeepClone();
const formData = ref({
    name: '',
    description: '',
    tags: []
})
const showTagDialog = ref(false)
const showDialog = ref(false);
const playlistId = ref(null)

// 打开创建歌单弹窗
const openDialog = (id) => {
    showDialog.value = true
    if (!id) {
        playlistId.value = null
        return;
    }
    playlistId.value = id
    const detail = deepClone(localStore.getLocalPlaylist(id).detail)
    formData.value = {
        name: detail.name,
        description: detail.description,
        tags: detail.tags
    }  
}

// 关闭创建歌单弹窗
const closeDialog = () => {
    showDialog.value = false
    playlistId.value = null
    // 清空表单数据
    formData.value = {
        name: '',
        description: '',
        tags: []
    }
    // 使select标签选中状态恢复
    document.getElementById('playlist-tags').selectedIndex = 0
}

// 创建新标签
const createTag = (e) => {
    const tag = e.target[0].value.trim()
    if (!tag) {
        return;
    }
    e.target[0].value = ''
    showTagDialog.value = false
    formData.value.tags.push(tag)
    localTags.value.push(tag)
}

// 选择标签
const handleSelectTag = (e) => {
    const tag = e.target.value
    const tags = e.target.parentNode.children[1].children
    if (formData.value.tags.includes(tag)) {
        console.log('已选择,不可以重复选择');        
    } else {
        formData.value.tags.push(tag)        
    }
    for (let i = 0; i < tags.length; i++){
        const item = tags[i];
        if (i === 0) {
            item.selected = true
        }else{
            item.selected = false
        }
    }
}

// 提交歌单
const submitPlaylist = () => {
    const { name, description, tags } = formData.value
    if (!name) {
        alert('歌单名称不能为空')
        return;
    }

    playlistId.value? 
    localStore.updateLocalPlaylist(playlistId.value, { name, description, tags }):
    localStore.createLocalPlaylist({ name, description, tags })

    closeDialog()
}

defineExpose({
    openDialog,
})
</script>

<style scoped>
.form-warp {
    width: 100%;
    height: 100%;
    
   
}
form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 20px;
    gap: 16px;
}
.form-group-name,
.form-group-img,
.form-group-tags,
.form-group-tagDiv,
.form-group-show-tags,
.form-group-desc,
.form-group-btn {
    width: 360px;
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 8px;
}
.form-group-show-tags {
    flex-wrap: wrap;
}
.form-group-desc {
    align-items: flex-start;
}
form label {
    font-size: 14px;
    font-weight: bold;
    color: #333;
}
form input[type="text"],
form textarea,
.form-group-tagDiv input[type="text"] {
    flex-grow: 1;
    border-radius: var(--border-radius-light);
    border: none;
    outline: none;
    transition: all 0.3s ease;
    font-size: 14px;
    color: #333;
    text-indent: 4px;
}
form textarea {
    height: 100px;
    resize: none;
    padding: 8px;
    box-shadow: #333 0px 0px 0px 1px;
}
.tagSelected {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px 8px 4px 16px;
    height: 24px;
    border-radius: 24px;
    background-color: #333;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.tagSelected.plus {
    padding: 4px 16px;
}
.tagSelected:hover {
    background-color: palevioletred;
    color: #fff;
}
.form-group-tagDiv {
    margin-bottom: 24px;
}
#playlist-tags {
    /* -webkit-appearance: none;
    -moz-appearance: none;
    appearance:none; */
    width: 96px;
    padding: 4px 16px;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    background-color: #333;
    color: #fff;
    font-size: 12px;
    outline: none;
    transition: all 0.3s ease;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
#playlist-tags:focus-visible {
    outline: none;
}
#playlist-tags option {
    border: none; 
    outline: none;
}
.form-group-btn {
    justify-content: flex-end;
}
.form-group-btn button {
    /* width: 100%; */
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background-color: #333;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}
.form-group-btn button:hover {
    background-color: palevioletred;
    color: #fff;
}
</style>