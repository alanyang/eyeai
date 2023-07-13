//@ts-nocheck

import { json, type ActionArgs, type redirect, type V2_MetaFunction, fetch, Request } from "@remix-run/node"
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

const defaultPrompt = "high quality, photorealistic, exquisite details, shot using a professional camera, natural lighting, true-to-life, photography"
const ApiKey = '5df0b614e8e581fe9d7ea6715e905044'
// const ApiGetToken = 'https://flagopen.baai.ac.cn/flagStudio/auth/getToken?apikey=5df0b614e8e581fe9d7ea6715e905044'
const ApiText2Image = 'https://flagopen.baai.ac.cn/flagStudio/v1/text2img'
const samplers = ['ddim', 'lmsd', 'pndm', 'euler_d', 'euler_a_d', 'dpm']
const styles = ['国画', '写实主义', '虚幻引擎', '黑白插画', '版绘', '低聚', '工业霓虹', '电影艺术', '史诗大片',
  '暗黑', '涂鸦', '漫画场景', '特写', '儿童画', '油画', '水彩画', '素描', '卡通画', '浮世绘', '赛博朋克', '吉卜力', '哑光', '现代中式',
  '相机', 'CG渲染', '动漫', '霓虹游戏', '蒸汽波', '宝可梦', '火影忍者', '圣诞老人',
  '个人特效', '通用漫画', 'Momoko', 'MJ风格', '剪纸', '毕加索', '梵高', '塞尚', '莫奈',
  '马克·夏加尔', '丢勒', '米开朗基罗', '爱德华·蒙克',
  '托马斯·科尔', '安迪·霍尔', '杜拉克', '比利宾', '布拉德利', '普罗旺森', '莫比乌斯', '格里斯利',
  '比普', '卡尔·西松', '玛丽·布莱尔', '埃里克·卡尔', '扎哈·哈迪德', '包豪斯', '英格尔斯', 'RHADS', '阿泰·盖兰']

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Definer Ai" },
    {
      name: "description",
      content: "Definer Ai Inner Api",
    },
  ]
}

const fetchFromBaai = async (data) => {
  const resp = await fetch(ApiText2Image, {
    method: 'post',
    headers: {
      token: 'aac1fafc4b5cc57b1542dff06ab39729',
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
  if (imageineData.code === 200) {
    return imageineData.data
  }
}

const fetchFromsd = async data => {
  var headers = new Headers();
  headers.append("Content-Type", "application/json")

  var raw = JSON.stringify({
    "key": "ptiYlOIM4Esx04n28WED0Vc4MxWVL4dYboZEz3g3ZTXpQTEnTJ3bMs3XPpOJ",
    "prompt": data.prompt,
    "negative_prompt": data.negative_prompts,
    "width": "512",
    "height": "512",
    "samples": "1",
    "num_inference_steps": "20",
    "seed": null,
    "guidance_scale": 7.5,
    "safety_checker": "yes",
    "multi_lingual": "no",
    "panorama": "no",
    "self_attention": "no",
    "upscale": "no",
    "embeddings_model": null,
    "webhook": null,
    "track_id": null
  })

  var requestOptions = {
    method: 'POST',
    headers,
    body: raw,
    redirect: 'follow'
  };

  const resp = await fetch("https://stablediffusionapi.com/api/v3/text2img", requestOptions)
  const json = await resp.json()
  if (json.status === 'success') {
    return json.output
  }
}

export async function action ({ request }: ActionArgs) {
  const formData = await request.formData();
  const { _action, ...data } = Object.fromEntries(formData)
  if (!data.prompt) data.prompt = defaultPrompt
  if (!samplers.includes(data.sampler)) data.sampler = 'euler_a_d'
  if (!styles.includes(data.style)) data.style = '特写'
  data.guidance_scale = parseInt(data.guidance_scale)
  if (data.guidance_scale > 20 || data.guidance_scale < 1) data.guidance_scale = 10
  data.steps = parseInt(data.steps)
  if (data.steps > 100 || data.steps < 10) data.steps = 60

  const images = await Promise.all([fetchFromBaai(data), fetchFromsd(data)])
  return json({ ok: 1, data: images.filter(it => !!it) })

}


export default function () {
  const fetcher = useFetcher()

  const [images, setImages] = useState([])

  const [sampler, setSampler] = useState('euler_a_d')

  const [style, setStyle] = useState('特写')

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok) {
      setImages(fetcher.data?.data)
    }
    if(fetcher.state === "submitting" || fetcher.state == "loading") {
      setImages([])
    }
  }, [fetcher])

  return (
    <main className="flex flex-col font-medium p-5">
      <section className="flex justify-start gap-3 bg-white rounded-lg">
        <fetcher.Form method="post" className="flex flex-col items-start w-1/2 gap-3 p-5">
          <div className="w-full">
            <label htmlFor="prompt">Prompt(Describe what you'd like generate)</label>
            <textarea type="text" id="prompt" placeholder="" rows={12} name="prompt" className="border-blue-500 border m-1 p-1 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-full" />
          </div>
          <div className="w-full">
            <label htmlFor="style">Negtive prompt</label>
            <input type="text" placeholder="" name="negative_prompts" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-full" />
          </div>
          <div className="w-full hidden">
            <label htmlFor="style">Style</label>
            <select id="style" onChange={event => setStyle(event.currentTarget.value)} defaultValue={'特写'}
              className="bg-gray-50 border border-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full">
              {
                styles.map(item => <option key={item} value={item}>{item}</option>)
              }
            </select>
          </div>

          <input type="text" placeholder="guidance(制导比例，取值[1-20])" name="guidance_scale" className="hidden border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/4" />
          <div className="w-full hidden">
            <label htmlFor="sampler">Sampler</label>
            <select id="sampler" onChange={event => setSampler(event.currentTarget.value)} defaultValue={"euler_a_d"}
              className=" bg-gray-50 border border-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full">
              <option value="ddim">ddim</option>
              <option value="lmsd">lmsd</option>
              <option value="pndm">pndm</option>
              <option value="euler_d">euler_d</option>
              <option value="euler_a_d">euler_a_d</option>
              <option value="dpm">dpm</option>
            </select>
          </div>

          <input type="hidden" name="sampler" value={sampler} />
          <div className="w-full hidden">
            <label htmlFor="steps">Steps(Value 0-100)</label>
            <input type="text" id="steps" defaultValue={60} name="steps" className=" border-blue-500 border m-1 p-1 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-full" />

          </div>


          <input type="hidden" name="style" value={style} />

          <button onClick={event => fetcher.submit({ _action: 'imagine' })} className="bg-blue-500  m-1 p-2 rounded hover:bg-blue-300 text-white px-3 font-bold w-full">Generate</button>
        </fetcher.Form>


        <section className="flex flex-col justify-center items-center gap-3 w-1/2 bg-gray-200">
          {

            images.length && images.map((it, i) => <Image width={"400"} height={"400"} key={i} src={it} />) || <span></span>

          }

          {
            ['submitting', 'loading'].includes(fetcher.state) &&
            <div className="flex flex-col justify-center items-center text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <div>Generating...</div>
            </div>

          }
        </section>
      </section>
    </main >
  )
}

const Image = ({ src }) => {
  if (Array.isArray(src)) {
    const [img] = src
    console.log(img)
    return <img src={img} className="rounded" />
  } else {
    return <img src={`data:image/jpeg;base64, ${src}`} className="rounded" />
  }
}
//MTExNDgzNzk4MTE2NjA1NTQyNA.GtDcbT._tgbNbjHEUupYz421nbxYM9LEy-wyeipag987o  discord auth token


