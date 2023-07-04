//@ts-nocheck

import { json, type ActionArgs, type redirect, fetch, Request } from "@remix-run/node"
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

const ApiKey = '5df0b614e8e581fe9d7ea6715e905044'
// const ApiGetToken = 'https://flagopen.baai.ac.cn/flagStudio/auth/getToken?apikey=5df0b614e8e581fe9d7ea6715e905044'
const ApiText2Image = 'https://flagopen.baai.ac.cn/flagStudio/v1/text2img'
const samplers = ['ddim', 'lmsd', 'pndm', 'euler_d', 'euler_a_d', 'dpm']
const styles =  ['国画', '写实主义', '虚幻引擎', '黑白插画', '版绘', '低聚', '工业霓虹', '电影艺术', '史诗大片', 
'暗黑', '涂鸦', '漫画场景', '特写', '儿童画', '油画', '水彩画', '素描', '卡通画', '浮世绘', '赛博朋克', '吉卜力', '哑光', '现代中式', 
'相机', 'CG渲染', '动漫', '霓虹游戏', '蒸汽波', '宝可梦', '火影忍者', '圣诞老人', 
'个人特效', '通用漫画', 'Momoko', 'MJ风格', '剪纸', '毕加索', '梵高', '塞尚', '莫奈', 
'马克·夏加尔', '丢勒', '米开朗基罗', '爱德华·蒙克', 
'托马斯·科尔', '安迪·霍尔', '杜拉克', '比利宾', '布拉德利', '普罗旺森', '莫比乌斯', '格里斯利', 
'比普', '卡尔·西松', '玛丽·布莱尔', '埃里克·卡尔', '扎哈·哈迪德', '包豪斯', '英格尔斯', 'RHADS', '阿泰·盖兰']

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const { _action, ...data } = Object.fromEntries(formData)
  // {
  //   prompt: 'Cat on the moon',
  //   guidance_scale: '',
  //   negative_prompts: '',
  //   sampler: 'ddim',
  //   steps: '',
  //   style: '赛博朋克'
  // }

  if(!data.prompt) return json({ok: 0})
  if(!samplers.includes(data.sampler)) data.sampler = 'ddim'
  if(!styles.includes(data.style)) data.style = '虚幻引擎'
  data.guidance_scale = parseInt(data.guidance_scale)
  if(data.guidance_scale > 20 || data.guidance_scale < 1) data.guidance_scale = 8
  data.steps = parseInt(data.steps)
  if(data.steps > 100 || data.steps < 10) data.steps = 60

  const resp = await fetch(ApiText2Image, {
    method: 'post',
    headers: {
      token: process.env.TOKEN,
      'Content-Type': 'application/json',
      "Accept": "application/json",
    },
    body: JSON.stringify({
      "prompt": data.prompt,
      "guidance_scale": data.guidance_scale,
      "height": 512,
      "negative_prompts": data.negative_prompts,
      "sampler": data.sampler,
      "seed": 1024,
      "steps": data.steps,
      "style": data.style,
      "upsample": 1,
      "width": 512
    })
  })
  const imageineData = await resp.json()
  if (imageineData.code === 200)
    return json({ ok: 1, data: imageineData.data })

  return json({ ok: 0 })
}


export default function () {
  const fetcher = useFetcher()

  const [baseImage, setImage] = useState('')

  const [sampler, setSampler] = useState('ddim')

  const [style, setStyle] = useState('虚幻引擎')

  useEffect(() => {
    console.log(fetcher.data)

    if (fetcher.state === 'idle' && fetcher.data?.ok) {
      console.log(fetcher.data)

      setImage(fetcher.data?.data)
    }
  }, [fetcher])

  return (
    <main className="flex flex-col justify-center">
      <h3 className="text-3xl">AI Compare</h3>
      <h5 className="text-xl font-thin">Current baai stable diffution algorithm</h5>
      <fetcher.Form method="post" className="flex flex-col mt-8">
        <div>
          <input type="text" placeholder="prompt" name="prompt" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/2" />
          <select placeholder="Style(样式)" onChange={event => setStyle(event.currentTarget.value)}
          class="bg-gray-50 border border-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-1/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected>生成样式</option>
            {
              styles.map( item => <option key={item} value={item}>{item}</option>)
            }
          </select>
          <input type="text" placeholder="guidance(制导比例，取值[1-20])" name="guidance_scale" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/4" />
          <input type="text" placeholder="negative prompts(否定提示词)" name="negative_prompts" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/4" />
          <select placeholder="Sampler(采样器)" onChange={event => setSampler(event.currentTarget.value)}
          class="bg-gray-50 border border-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-1/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected>Sampler采样器</option>
            <option value="ddim">ddim</option>
            <option value="lmsd">lmsd</option>
            <option value="pndm">pndm</option>
            <option value="euler_d">euler_d</option>
            <option value="euler_a_d">euler_a_d</option>
            <option value="dpm">dpm</option>
          </select>
          <input type="hidden" name="sampler" value={sampler}/>
          <input type="text" placeholder="Steps(去噪，取值[0-100])" name="steps" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/5" />

          
          <input type="hidden" name="style" value={style}/>

        </div>
        <button onClick={event => fetcher.submit({ _action: 'imagine' })} className="bg-blue-500  m-1 p-2 rounded active:bg-blue-200 hover:bg-blue-300 focus:bg-blue-200 text-white px-3 font-thin">Text2Image</button>
        {['submitting', 'loading'].includes(fetcher.state) ?
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          : <></>}


      </fetcher.Form>
      {
        baseImage && baseImage.length &&
        <section><img src={`data:image/jpeg;base64, ${baseImage}`} className="rounded rounded-2xl" /></section> ||
        <span></span>
      }
    </main>
  )
}
//MTExNDgzNzk4MTE2NjA1NTQyNA.GtDcbT._tgbNbjHEUupYz421nbxYM9LEy-wyeipag987o  discord auth token