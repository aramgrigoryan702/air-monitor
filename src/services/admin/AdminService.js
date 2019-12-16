import axiosInstance from '../axiosInstance';

export const AdminService = {
    findAllUsers: (data) => {
        return axiosInstance
            .get('/admin/users').then(result => result.data);
    },
    findAdminUsers: (data) => {
        return axiosInstance
            .get('/admin/users/adminUsers').then(result => result.data);
    },
    findEditorUsers: (data) => {
        return axiosInstance
            .get('admin/users/editorUsers').then(result => result.data);
    },
    findViewerUsers: (data) => {
        return axiosInstance
            .get('/admin/users/viewerUsers').then(result => result.data);
    },
    disableUser: (data)=>{
        return axiosInstance
            .post('/admin/users/disableUser', data).then(result => result.data);
    },
    enableUser: (data)=>{
        return axiosInstance
            .post('/admin/users/enableUser', data).then(result => result.data);
    },
    inviteUser: (data)=>{
        return axiosInstance
            .post('/admin/users/inviteUser', data).then(result => result.data);
    },
    deleteUser: (data)=>{
        return axiosInstance
            .post('/admin/users/deleteUser', data).then(result => result.data);
    },moveUserToAdminGroup: (data)=>{
        return axiosInstance
            .post('/admin/users/moveUserToAdminGroup', data).then(result => result.data);
    },
    moveUserToEditorGroup: (data)=>{
        return axiosInstance
            .post('/admin/users/moveUserToEditorGroup', data).then(result => result.data);
    },
    moveUserToViewerGroup: (data)=>{
        return axiosInstance
            .post('/admin/users/moveUserToViewerGroup', data).then(result => result.data);
    },
    refreshDataView: ()=>{
        return axiosInstance
            .post('/admin/refresh_cache/refresh_chart_views').then(result => result);
    },
    refreshStagingData: ()=>{
        return axiosInstance
            .post('/admin/refresh_staging_db/refresh').then(result => result);
    },
    getQueueStatus: (jobId)=>{
        return axiosInstance
            .get(`/admin/job/${jobId}`).then(result => result);
    }
};