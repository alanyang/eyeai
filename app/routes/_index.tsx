//@ts-nocheck

import { json, type ActionArgs, type redirect, type V2_MetaFunction, fetch, Request } from "@remix-run/node"
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

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
  if(json.status === 'success') {
    return json.output
  }
}

export async function action ({ request }: ActionArgs) {
  const formData = await request.formData();
  const { _action, ...data } = Object.fromEntries(formData)
  if (!data.prompt) return json({ ok: 0 })
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
      console.log(fetcher.data)
      setImages(fetcher.data?.data)
    }
  }, [fetcher])

  return (
    <main className="flex flex-col justify-center m-3 font-thin">
      <div className="mt-1">
        <img src="data:image/png;base64,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" />
      </div>
      <h5 className="text-normal font-thin">Base stable diffution algorithm</h5>
      <fetcher.Form method="post" className="flex flex-col mt-8">
        <div>
          <input type="text" placeholder="prompt" name="prompt" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/2" />
          <select placeholder="Style(样式)" onChange={event => setStyle(event.currentTarget.value)} defaultValue={''}
            className="bg-gray-50 border border-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-1/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option key={'name'}>生成样式</option>
            {
              styles.map(item => <option key={item} value={item}>{item}</option>)
            }
          </select>
          <input type="text" placeholder="guidance(制导比例，取值[1-20])" name="guidance_scale" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/4" />
          <input type="text" placeholder="negative prompts(否定提示词)" name="negative_prompts" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/4" />
          <select placeholder="Sampler(采样器)" onChange={event => setSampler(event.currentTarget.value)} defaultValue={""}
            className="bg-gray-50 border border-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-1/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option key="sampler">Sampler采样器</option>
            <option value="ddim">ddim</option>
            <option value="lmsd">lmsd</option>
            <option value="pndm">pndm</option>
            <option value="euler_d">euler_d</option>
            <option value="euler_a_d">euler_a_d</option>
            <option value="dpm">dpm</option>
          </select>
          <input type="hidden" name="sampler" value={sampler} />
          <input type="text" placeholder="Steps(去噪，取值[0-100])" name="steps" className="border-blue-500 border m-1 p-2 rounded active:border-blue-200 hover:border-blue-300 focus:border-blue-200 focus:outline-none w-1/5" />


          <input type="hidden" name="style" value={style} />

        </div>
        <button onClick={event => fetcher.submit({ _action: 'imagine' })} className="bg-blue-500  m-1 p-2 rounded hover:bg-blue-300 text-white px-3 font-thin">Text2Image</button>
        {['submitting', 'loading'].includes(fetcher.state) ?
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          : <></>}


      </fetcher.Form>
      <section className="flex justify-center gap-2">
        {

          images.length && images.map((it, i) => <Image key={i} src={it} />) || <span></span>

        }
      </section>
    </main >
  )
}

const Image = ({src}) => {
  if(Array.isArray(src)) {
    const [ img ] = src
    console.log(img)
    return <img src={img} className="rounded" />
  } else {
    return <img src={`data:image/jpeg;base64, ${src}`} className="rounded" />
  }
}
//MTExNDgzNzk4MTE2NjA1NTQyNA.GtDcbT._tgbNbjHEUupYz421nbxYM9LEy-wyeipag987o  discord auth token