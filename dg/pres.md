% Wat
% Damon Burgett
% September 16, 2016

# ![Images](images/cover.png)
# Why?
# We need to QC our imagery at a very large scale
# ![Images](images/offset.png)
# How to identify this automatically?
# ![Images](images/cover.png) Telemetry density data
# ![Images](images/density1.png)
# ![Images](images/density2.png)
# A [Map](https://api.tiles.mapbox.com/v4/dnomadb.density-test/page.html?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg)
# ![Images](images/gcp1.png)
# ~1/2 are control, ~1/2 are validation
# Image Chips
# ![Images](https://cloud.githubusercontent.com/assets/5084513/16239299/0f9a6222-3799-11e6-9cb4-f4e740b71224.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/16239382/6cdc58c8-3799-11e6-807a-41ce100a8564.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/16242246/716261fa-37a6-11e6-9c12-555ab64a0c93.jpg)
# Tiles ~= image chips
# How would we match?
# Fourier image convolution
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18069395/a8ba1644-6dfb-11e6-967b-4821e3791fe1.png)
# With images of similar rotation and scale, we can match in the planar space
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18069402/bf48420a-6dfb-11e6-9d27-a0a4d3ac359d.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18069441/fdaa6aa0-6dfb-11e6-9b55-f70f23b6c77e.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18069544/ba3daea2-6dfc-11e6-873b-07cdb0cafffb.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18070056/2c9c8c9a-6e00-11e6-88bc-4df3e7e0b05b.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18070075/4a04d490-6e00-11e6-8017-c63229699283.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18070152/e7131134-6e00-11e6-8020-7863ac2fe657.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18070642/14d3a52c-6e04-11e6-9a5e-cfd42d137689.png)
# ![Images](images/sf.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18071955/a7544bea-6e0e-11e6-80b3-60e4916cc906.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18071979/d641aa60-6e0e-11e6-8738-577c9e3e61e8.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18072000/24ac4656-6e0f-11e6-84ce-0343f1bb7d55.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18072022/75a0aeda-6e0f-11e6-930a-b52a367fac9c.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18444706/2f16b70a-78cf-11e6-84cb-95b76d4826e7.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18444709/2f1e8cb4-78cf-11e6-9beb-fff8915ab398.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18444708/2f19fcda-78cf-11e6-9c0a-5c0e676576f7.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18444710/2f2dacbc-78cf-11e6-856f-4ffebfcbfcff.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18444707/2f183d32-78cf-11e6-9d82-6464ca8c9dbe.png)
# ![Images](https://cloud.githubusercontent.com/assets/5084513/18444711/2f46b43c-78cf-11e6-8923-6afcb323cbf0.png)

