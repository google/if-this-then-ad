// import googleAdsAgent from './index';
// import { AgentTask, EntityType } from './interfaces';
// import GoogleAdsClient from './googleads-client';

// const oauthToken = 'ya29.A0ARrdaM87DcWB-VIDJPOJfrEBgiIxqRP2rstnEfc8X3JHP5NyxL51DkoAthfvkizaPjfrFqrPxko_WPhheAopLvhRhjcBb4CaM8KeqJlDnxiUKdCmxi3i7G6TfRWmQcTpiWiaIR-kHTRyt_z_0j0i_OftpsPm';

// const task: AgentTask = {
//     token: {
//         auth: oauthToken
//     },
//     target: {
//         ruleId: '111',
//         agentId: 'GoogleAds',
//         result: true,
//         actions: [
//             {
//                 type: 'activate',
//                 params: [
//                     {
//                         key: 'entityId',
//                         value: '144497304708',
//                     },
//                     {
//                         key: 'entityType',
//                         value: 'adGroup',
//                     },
//                 ],
//             },
//         ],
//     },
//     ownerSettings: {
//         developerToken: 'wt-j7hG8SR7saKOgaP8q7Q',
//         managerAccountId: '5669196387',
//         customerAccountId: '9044713567'
//     }

// };

// const customerId = '9044713567';
// const managerId = '5669196387';
// const devToken = 'wt-j7hG8SR7saKOgaP8q7Q';
// const client = new GoogleAdsClient(customerId, managerId, oauthToken, devToken);

// client.listAdGroups(false)
//         .then((res) => {
//             console.log(res);
//         }); 

// // client.getAdGroup('144497304708')
// //     .then((res) => {
// //         console.log(res);
// //     });
// // client.listCampaigns(true)
// //       .then((res) => {
// //           console.log(res);
// //       })

// // client.updateAdGroup('144497304668', false )
// //         .then((res) => {
// //             console.log(res)
// //             // console.log(JSON.stringify(res.request.data, null, 2));
// //         }).catch((err) => {
// //             console.log(err)
// //         });
// // googleAdsAgent.execute(task)
// //     .then((x) => console.log(x))
// //     .catch((x) => console.log(x.response?.data?.error || x));

// // googleAdsAgent.getEntityList(
// //         oauthToken,
// //         'wt-j7hG8SR7saKOgaP8q7Q',
// //         '5669196387',
// //         '9044713567',
// //         'adGroup',
// //         '', true)
// //     .then((x) => console.log(x))
// //     .catch((x) => console.log(x.response?.data?.error || x));

// // googleAdsAgent.getEntityList(
// //         oauthToken,
// //         'wt-j7hG8SR7saKOgaP8q7Q',
// //         '5669196387',
// //         '9044713567',
// //         'campaign', undefined, false)
// //     .then((x) => console.log(x))
// //     .catch((x) => console.log(x.response.data.error));
